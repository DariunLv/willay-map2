import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Title,
  Text,
  Box,
  Paper,
  Button,
  Group,
  Stepper,
  Textarea,
  Image,
  SimpleGrid,
  ActionIcon,
  FileButton,
  Badge,
  Alert,
  LoadingOverlay,
  ThemeIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconMapPin,
  IconCamera,
  IconUpload,
  IconX,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconCurrentLocation,
  IconPhoto,
  IconSend,
  IconRoadOff,
  IconBulbOff,
  IconTrash,
  IconDroplet,
  IconAlertTriangle,
  IconTree,
  IconBuilding,
  IconDots,
} from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mapa con selección de ubicación (carga dinámica)
const MapSelector = dynamic(
  () => import('@/components/dashboard/ciudadano/MapSelector'),
  { ssr: false }
)

// Iconos para categorías
const ICONOS_CATEGORIA = {
  'IconRoadOff': IconRoadOff,
  'IconBulbOff': IconBulbOff,
  'IconTrash': IconTrash,
  'IconDroplet': IconDroplet,
  'IconAlertTriangle': IconAlertTriangle,
  'IconTree': IconTree,
  'IconBuilding': IconBuilding,
  'IconDots': IconDots,
}

function NuevoReporte() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [formData, setFormData] = useState({
    categoria: null,
    categoriaId: '',
    descripcion: '',
    fotos: [],
    ubicacion: null,
    direccion: '',
  })

  // Cargar categorías desde Supabase
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .eq('is_active', true)

        if (error) throw error
        setCategorias(data || [])
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    }
    cargarCategorias()
  }, [])

  // NO obtener ubicación automáticamente - el usuario la selecciona manualmente

  // Manejo de fotos
  const handleDrop = (files) => {
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setFormData((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...newPhotos].slice(0, 3),
    }))
  }

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }))
  }

  // Seleccionar categoría
  const handleSelectCategoria = (cat) => {
    setFormData((prev) => ({
      ...prev,
      categoria: cat,
      categoriaId: cat.id,
    }))
  }

  // Manejar cambio de ubicación desde MapSelector
  const handleUbicacionChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      ubicacion: coords,
    }))
  }

  // Validación por paso
  const canProceed = () => {
    switch (active) {
      case 0:
        return formData.categoriaId !== ''
      case 1:
        return formData.fotos.length > 0
      case 2:
        return formData.ubicacion !== null
      case 3:
        return formData.descripcion.trim().length >= 10
      default:
        return true
    }
  }

  // Subir foto a Supabase Storage
  const uploadFoto = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('reportes-fotos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('reportes-fotos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // Enviar reporte a Supabase
  const handleSubmit = async () => {
    if (!user) {
      notifications.show({
        title: 'Error',
        message: 'Debes iniciar sesión para crear un reporte',
        color: 'red',
      })
      return
    }

    if (!formData.ubicacion) {
      notifications.show({
        title: 'Error',
        message: 'Debes seleccionar una ubicación en el mapa',
        color: 'red',
      })
      return
    }

    setLoading(true)

    try {
      // 1. Subir foto
      let fotoUrl = null
      if (formData.fotos.length > 0) {
        fotoUrl = await uploadFoto(formData.fotos[0].file)
      }

      // 2. Crear reporte en Supabase
      const { data: reporte, error: reporteError } = await supabase
        .from('reportes')
        .insert({
          usuario_id: user.id,
          categoria_id: formData.categoriaId,
          descripcion: formData.descripcion,
          direccion: formData.direccion || null,
          latitud: formData.ubicacion.lat,
          longitud: formData.ubicacion.lng,
          foto_url: fotoUrl,
          estado: 'nuevo',
          prioridad: 'media',
        })
        .select('*')
        .single()

      if (reporteError) throw reporteError

      // 3. Crear historial inicial
      await supabase
        .from('historial_estados')
        .insert({
          reporte_id: reporte.id,
          estado_nuevo: 'nuevo',
          comentario: 'Reporte creado por ciudadano',
        })

      // Guardar código para mostrar
      setCodigoGenerado(reporte.codigo)

      notifications.show({
        title: 'Reporte enviado',
        message: `Tu reporte ${reporte.codigo} fue creado exitosamente`,
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      // Ir al paso de éxito
      setActive(5)

    } catch (error) {
      console.error('Error creando reporte:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo crear el reporte. Intenta nuevamente.',
        color: 'red',
        icon: <IconX size={18} />,
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (active === 4) {
      handleSubmit()
    } else {
      setActive((current) => Math.min(current + 1, 5))
    }
  }

  const prevStep = () => setActive((current) => Math.max(current - 1, 0))

  return (
    <>
      <Head>
        <title>Nuevo Reporte - Willay Map</title>
        <meta name="description" content="Reportar un problema ciudadano" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <DashboardLayout user={profile}>
        <Box maw={800} mx="auto" pos="relative">
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ blur: 2 }} />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Group mb="xl">
              <ActionIcon
                variant="light"
                size="lg"
                radius="md"
                onClick={() => router.back()}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Box>
                <Title order={2} style={{ fontFamily: 'Space Grotesk' }}>
                  Nuevo Reporte
                </Title>
                <Text c="dimmed" size="sm">
                  Reporta un problema en tu ciudad
                </Text>
              </Box>
            </Group>
          </motion.div>

          {/* Stepper */}
          <Paper radius="xl" p="xl" mb="lg" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <Stepper
              active={active}
              onStepClick={setActive}
              allowNextStepsSelect={false}
              size="sm"
              styles={{
                stepBody: { display: 'none' },
                step: { padding: 0 },
                stepIcon: { borderWidth: 2 },
                separator: { marginLeft: 2, marginRight: 2 },
              }}
            >
              <Stepper.Step icon={<IconPhoto size={18} />} />
              <Stepper.Step icon={<IconCamera size={18} />} />
              <Stepper.Step icon={<IconMapPin size={18} />} />
              <Stepper.Step icon={<IconSend size={18} />} />
              <Stepper.Step icon={<IconCheck size={18} />} />
            </Stepper>
          </Paper>

          {/* Contenido del paso */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                radius="xl"
                p="xl"
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  minHeight: 400,
                }}
              >
                {/* Paso 0: Categoría */}
                {active === 0 && (
                  <Box>
                    <Title order={3} mb="xs">
                      ¿Qué tipo de problema es?
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Selecciona la categoría que mejor describe el problema
                    </Text>

                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                      {categorias.map((cat) => {
                        const IconComponent = ICONOS_CATEGORIA[cat.icono] || IconDots
                        const isSelected = formData.categoriaId === cat.id
                        return (
                          <motion.div
                            key={cat.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Paper
                              p="lg"
                              radius="lg"
                              onClick={() => handleSelectCategoria(cat)}
                              style={{
                                cursor: 'pointer',
                                border: isSelected
                                  ? `2px solid ${cat.color}`
                                  : '2px solid #e2e8f0',
                                background: isSelected
                                  ? `${cat.color}15`
                                  : 'white',
                                transition: 'all 0.2s ease',
                                textAlign: 'center',
                              }}
                            >
                              <ThemeIcon
                                size={48}
                                radius="md"
                                style={{ background: cat.color, margin: '0 auto 12px' }}
                              >
                                <IconComponent size={24} color="white" />
                              </ThemeIcon>
                              <Text size="sm" fw={500}>
                                {cat.nombre}
                              </Text>
                            </Paper>
                          </motion.div>
                        )
                      })}
                    </SimpleGrid>
                  </Box>
                )}

                {/* Paso 1: Fotos */}
                {active === 1 && (
                  <Box>
                    <Title order={3} mb="xs">
                      Sube una foto del problema
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      La foto es obligatoria y ayuda a identificar el problema
                    </Text>

                    <Box
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: 16,
                        padding: 40,
                        textAlign: 'center',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FileButton
                        onChange={(file) => file && handleDrop([file])}
                        accept="image/*"
                      >
                        {(props) => (
                          <Box {...props}>
                            <IconUpload size={48} color="#94a3b8" stroke={1.5} />
                            <Text fw={600} mt="md" c="dark">
                              Arrastra o haz clic para subir
                            </Text>
                            <Text size="sm" c="dimmed" mt="xs">
                              PNG, JPG hasta 5MB (máx. 3 fotos)
                            </Text>
                          </Box>
                        )}
                      </FileButton>
                    </Box>

                    {formData.fotos.length > 0 && (
                      <SimpleGrid cols={3} mt="lg">
                        {formData.fotos.map((photo, index) => (
                          <Box key={index} style={{ position: 'relative' }}>
                            <Image
                              src={photo.preview}
                              alt={`Foto ${index + 1}`}
                              radius="md"
                              height={120}
                              fit="cover"
                            />
                            <ActionIcon
                              variant="filled"
                              color="red"
                              size="sm"
                              radius="xl"
                              style={{ position: 'absolute', top: 8, right: 8 }}
                              onClick={() => removePhoto(index)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </Box>
                )}

                {/* Paso 2: Ubicación */}
                {active === 2 && (
                  <Box>
                    <Title order={3} mb="xs">
                      ¿Dónde está el problema?
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Usa el botón "Mi ubicación" o haz clic en el mapa para marcar el lugar exacto
                    </Text>

                    <MapSelector
                      value={formData.ubicacion}
                      onChange={handleUbicacionChange}
                    />

                    {formData.ubicacion && (
                      <Alert
                        icon={<IconCheck size={18} />}
                        color="green"
                        mt="md"
                        radius="md"
                      >
                        Ubicación seleccionada: {formData.ubicacion.lat.toFixed(6)}, {formData.ubicacion.lng.toFixed(6)}
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Paso 3: Descripción */}
                {active === 3 && (
                  <Box>
                    <Title order={3} mb="xs">
                      Describe el problema
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Proporciona detalles adicionales (mínimo 10 caracteres)
                    </Text>

                    <Textarea
                      placeholder="Describe el problema con el mayor detalle posible. Por ejemplo: 'Bache de aproximadamente 50cm de diámetro en el carril derecho, representa peligro para vehículos y motos.'"
                      minRows={6}
                      value={formData.descripcion}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
                      }
                      styles={{
                        input: {
                          fontSize: 16,
                          borderRadius: 12,
                        },
                      }}
                    />

                    <Group justify="space-between" mt="md">
                      <Text size="sm" c={formData.descripcion.length < 10 ? 'red' : 'green'}>
                        {formData.descripcion.length} / 10 caracteres mínimo
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formData.descripcion.length} / 500
                      </Text>
                    </Group>
                  </Box>
                )}

                {/* Paso 4: Confirmación */}
                {active === 4 && (
                  <Box>
                    <Title order={3} mb="xs">
                      Confirma tu reporte
                    </Title>
                    <Text c="dimmed" size="sm" mb="xl">
                      Revisa la información antes de enviar
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Categoría</Text>
                        <Badge size="lg" style={{ background: formData.categoria?.color, color: 'white' }}>
                          {formData.categoria?.nombre}
                        </Badge>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Fotos</Text>
                        <Text>{formData.fotos.length} foto(s) adjuntada(s)</Text>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Ubicación</Text>
                        <Text size="sm">
                          {formData.ubicacion 
                            ? `${formData.ubicacion.lat.toFixed(6)}, ${formData.ubicacion.lng.toFixed(6)}`
                            : 'No seleccionada'}
                        </Text>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Estado inicial</Text>
                        <Badge color="blue">Nuevo</Badge>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc', gridColumn: '1 / -1' }}>
                        <Text size="sm" fw={600} mb="xs">Descripción</Text>
                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {formData.descripcion}
                        </Text>
                      </Paper>
                    </SimpleGrid>

                    {formData.fotos.length > 0 && (
                      <Group mt="md">
                        {formData.fotos.map((photo, index) => (
                          <Image
                            key={index}
                            src={photo.preview}
                            alt={`Foto ${index + 1}`}
                            radius="md"
                            height={80}
                            width={80}
                            fit="cover"
                          />
                        ))}
                      </Group>
                    )}
                  </Box>
                )}

                {/* Paso 5: Éxito */}
                {active === 5 && (
                  <Box ta="center" py="xl">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <Box
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px',
                          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <IconCheck size={50} color="white" />
                      </Box>
                    </motion.div>

                    <Title order={2} mb="md">
                      ¡Reporte Enviado!
                    </Title>
                    <Text c="dimmed" size="lg" mb="lg">
                      Tu reporte ha sido recibido correctamente
                    </Text>

                    <Paper
                      p="lg"
                      radius="lg"
                      style={{
                        background: '#f8fafc',
                        display: 'inline-block',
                      }}
                    >
                      <Text size="sm" c="dimmed">Código de seguimiento</Text>
                      <Text fw={700} size="xl" style={{ fontFamily: 'Space Grotesk' }}>
                        {codigoGenerado || 'RPT-XXXXXXXX-XXXX'}
                      </Text>
                    </Paper>

                    <Text size="sm" c="dimmed" mt="xl">
                      Recibirás notificaciones sobre el estado de tu reporte
                    </Text>

                    <Group justify="center" gap="md" mt="xl">
                      <Button
                        variant="light"
                        size="lg"
                        radius="md"
                        onClick={() => router.push('/ciudadano/reportes')}
                      >
                        Ver mis reportes
                      </Button>
                      <Button
                        variant="gradient"
                        gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
                        size="lg"
                        radius="md"
                        onClick={() => router.push('/ciudadano/dashboard')}
                      >
                        Volver al Dashboard
                      </Button>
                    </Group>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </AnimatePresence>

          {/* Botones de navegación */}
          {active < 5 && (
            <Group justify="space-between" mt="lg">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={18} />}
                onClick={prevStep}
                disabled={active === 0}
              >
                Anterior
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
                rightSection={active === 4 ? <IconSend size={18} /> : <IconArrowRight size={18} />}
                onClick={nextStep}
                disabled={!canProceed()}
                loading={loading}
              >
                {active === 4 ? 'Enviar Reporte' : 'Siguiente'}
              </Button>
            </Group>
          )}
        </Box>
      </DashboardLayout>
    </>
  )
}

export default withAuth(NuevoReporte, { allowedRoles: ['ciudadano'] })