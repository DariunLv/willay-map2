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
  Select,
  Textarea,
  Image,
  SimpleGrid,
  ActionIcon,
  FileButton,
  Progress,
  Badge,
  Alert,
  Tooltip,
} from '@mantine/core'
import { useDropzone } from '@mantine/dropzone'
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
  IconAlertCircle,
  IconPhoto,
  IconSend,
  IconSparkles,
} from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// Mapa con selección de ubicación (carga dinámica)
const MapSelector = dynamic(
  () => import('@/components/dashboard/ciudadano/MapSelector'),
  { ssr: false }
)

const categorias = [
  { value: 'bache', label: '🕳️ Bache / Hundimiento', color: '#ef4444' },
  { value: 'alumbrado', label: '💡 Alumbrado Público', color: '#f59e0b' },
  { value: 'basura', label: '🗑️ Residuos / Basura', color: '#10b981' },
  { value: 'agua', label: '💧 Agua / Alcantarillado', color: '#3b82f6' },
  { value: 'senalizacion', label: '🚦 Señalización', color: '#8b5cf6' },
  { value: 'areas_verdes', label: '🌳 Áreas Verdes', color: '#22c55e' },
  { value: 'infraestructura', label: '🏗️ Infraestructura', color: '#64748b' },
  { value: 'otros', label: '📋 Otros', color: '#94a3b8' },
]

export default function NuevoReporte() {
  const router = useRouter()
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoria: '',
    descripcion: '',
    fotos: [],
    ubicacion: null,
    direccion: '',
  })

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            ubicacion: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  // Manejo de fotos
  const handleDrop = (files) => {
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setFormData((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...newPhotos].slice(0, 3), // Máximo 3 fotos
    }))
  }

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }))
  }

  // Validación por paso
  const canProceed = () => {
    switch (active) {
      case 0:
        return formData.categoria !== ''
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

  // Enviar reporte
  const handleSubmit = async () => {
    setLoading(true)
    
    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Aquí iría la lógica real de envío a Supabase
    
    setLoading(false)
    setActive(5) // Paso de confirmación
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
      </Head>

      <DashboardLayout user={{ name: 'Usuario' }}>
        <Box maw={800} mx="auto">
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
                      {categorias.map((cat) => (
                        <motion.div
                          key={cat.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Paper
                            p="lg"
                            radius="lg"
                            onClick={() => setFormData((prev) => ({ ...prev, categoria: cat.value }))}
                            style={{
                              cursor: 'pointer',
                              border: formData.categoria === cat.value
                                ? `2px solid ${cat.color}`
                                : '2px solid #e2e8f0',
                              background: formData.categoria === cat.value
                                ? `${cat.color}08`
                                : 'white',
                              transition: 'all 0.2s ease',
                              textAlign: 'center',
                            }}
                          >
                            <Text size="xl" mb="xs">
                              {cat.label.split(' ')[0]}
                            </Text>
                            <Text size="sm" fw={500}>
                              {cat.label.split(' ').slice(1).join(' ')}
                            </Text>
                          </Paper>
                        </motion.div>
                      ))}
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

                    {/* Dropzone */}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = '#eff6ff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1'
                        e.currentTarget.style.background = '#f8fafc'
                      }}
                    >
                      <FileButton
                        onChange={(files) => handleDrop(files ? [files] : [])}
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

                    {/* Preview de fotos */}
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
                    <Group justify="space-between" mb="xl">
                      <Box>
                        <Title order={3} mb="xs">
                          ¿Dónde está el problema?
                        </Title>
                        <Text c="dimmed" size="sm">
                          Marca la ubicación exacta en el mapa
                        </Text>
                      </Box>
                      <Button
                        variant="light"
                        leftSection={<IconCurrentLocation size={18} />}
                        onClick={getCurrentLocation}
                      >
                        Mi ubicación
                      </Button>
                    </Group>

                    <Box
                      style={{
                        height: 350,
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <MapSelector
                        position={formData.ubicacion}
                        onPositionChange={(pos) =>
                          setFormData((prev) => ({ ...prev, ubicacion: pos }))
                        }
                      />
                    </Box>

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
                      {/* Resumen */}
                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Categoría</Text>
                        <Badge size="lg" color="blue">
                          {categorias.find((c) => c.value === formData.categoria)?.label}
                        </Badge>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                        <Text size="sm" fw={600} mb="xs">Fotos</Text>
                        <Text>{formData.fotos.length} foto(s) adjuntada(s)</Text>
                      </Paper>

                      <Paper p="md" radius="lg" style={{ background: '#f8fafc', gridColumn: '1 / -1' }}>
                        <Text size="sm" fw={600} mb="xs">Descripción</Text>
                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {formData.descripcion}
                        </Text>
                      </Paper>
                    </SimpleGrid>

                    {/* Preview de fotos */}
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
                        RPT-{String(Date.now()).slice(-6)}
                      </Text>
                    </Paper>

                    <Text size="sm" c="dimmed" mt="xl">
                      Recibirás notificaciones sobre el estado de tu reporte
                    </Text>

                    <Button
                      variant="gradient"
                      gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
                      size="lg"
                      radius="md"
                      mt="xl"
                      onClick={() => router.push('/ciudadano/dashboard')}
                    >
                      Volver al Dashboard
                    </Button>
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