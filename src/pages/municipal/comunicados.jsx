// ============================================
// COMUNICADOS MUNICIPAL - SOLO BASE64
// Archivo: src/pages/municipal/comunicados.jsx
// ============================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Box,
  Badge,
  ThemeIcon,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  ActionIcon,
  Tooltip,
  Card,
  Loader,
  Center,
  SimpleGrid,
  Switch,
  Image,
  Tabs,
  FileInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconSpeakerphone,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconCalendar,
  IconPhoto,
  IconAlertCircle,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconStar,
  IconClock,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const TIPOS_COMUNICADO = [
  { value: 'aviso', label: 'Aviso General', color: 'blue', icon: IconInfoCircle },
  { value: 'alerta', label: 'Alerta Importante', color: 'red', icon: IconAlertCircle },
  { value: 'evento', label: 'Evento', color: 'green', icon: IconCalendar },
  { value: 'noticia', label: 'Noticia', color: 'violet', icon: IconSpeakerphone },
]

function ComunicadosMunicipal() {
  const { user, profile } = useAuth()
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [tabActiva, setTabActiva] = useState('todos')

  // Imagen
  const [imagenPreview, setImagenPreview] = useState(null)

  const form = useForm({
    initialValues: {
      titulo: '',
      contenido: '',
      tipo: 'aviso',
      activo: true,
      destacado: false,
    },
    validate: {
      titulo: (v) => (v.length < 5 ? 'Mínimo 5 caracteres' : null),
      contenido: (v) => (v.length < 20 ? 'Mínimo 20 caracteres' : null),
    },
  })

  const cargarComunicados = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          setComunicados([])
          return
        }
        throw error
      }
      setComunicados(data || [])
    } catch (error) {
      console.error('Error:', error)
      setComunicados([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarComunicados()
  }, [])

  // Convertir imagen a base64
  const convertirABase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null)
        return
      }
      
      // Verificar tamaño (máx 2MB para base64)
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('La imagen debe ser menor a 2MB'))
        return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Manejar selección de imagen
  const handleImagenSelect = async (file) => {
    if (!file) {
      setImagenPreview(null)
      return
    }

    try {
      const base64 = await convertirABase64(file)
      setImagenPreview(base64)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo procesar la imagen',
        color: 'red',
      })
    }
  }

  // Eliminar imagen
  const eliminarImagen = () => {
    setImagenPreview(null)
  }

  const abrirModal = (comunicado = null) => {
    if (comunicado) {
      setEditando(comunicado)
      form.setValues({
        titulo: comunicado.titulo,
        contenido: comunicado.contenido,
        tipo: comunicado.tipo,
        activo: comunicado.activo,
        destacado: comunicado.destacado,
      })
      setImagenPreview(comunicado.imagen_url || null)
    } else {
      setEditando(null)
      form.reset()
      setImagenPreview(null)
    }
    setModalOpen(true)
  }

  const guardarComunicado = async (values) => {
    setGuardando(true)
    try {
      const datos = {
        ...values,
        imagen_url: imagenPreview || null,
        fecha_publicacion: new Date().toISOString(),
        autor_id: user?.id,
        updated_at: new Date().toISOString(),
      }

      if (editando) {
        const { error } = await supabase
          .from('comunicados')
          .update(datos)
          .eq('id', editando.id)

        if (error) throw error
        notifications.show({ title: '✅ Actualizado', message: 'Comunicado actualizado', color: 'green' })
      } else {
        const { error } = await supabase.from('comunicados').insert({
          ...datos,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        notifications.show({ title: '✅ Publicado', message: 'Comunicado publicado', color: 'green' })
      }

      setModalOpen(false)
      setImagenPreview(null)
      cargarComunicados()
    } catch (error) {
      console.error('Error:', error)
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    } finally {
      setGuardando(false)
    }
  }

  const eliminarComunicado = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este comunicado?')) return

    try {
      const { error } = await supabase.from('comunicados').delete().eq('id', id)
      if (error) throw error
      notifications.show({ title: 'Eliminado', message: 'Comunicado eliminado', color: 'green' })
      cargarComunicados()
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    }
  }

  const toggleActivo = async (comunicado) => {
    try {
      const { error } = await supabase
        .from('comunicados')
        .update({ activo: !comunicado.activo })
        .eq('id', comunicado.id)

      if (error) throw error
      cargarComunicados()
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    }
  }

  const toggleDestacado = async (comunicado) => {
    try {
      const { error } = await supabase
        .from('comunicados')
        .update({ destacado: !comunicado.destacado })
        .eq('id', comunicado.id)

      if (error) throw error
      cargarComunicados()
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTipoInfo = (tipo) => TIPOS_COMUNICADO.find(t => t.value === tipo) || TIPOS_COMUNICADO[0]

  // Filtrar por tab
  const comunicadosFiltrados = comunicados.filter(c => {
    if (tabActiva === 'todos') return true
    if (tabActiva === 'activos') return c.activo
    if (tabActiva === 'destacados') return c.destacado
    if (tabActiva === 'inactivos') return !c.activo
    return true
  })

  // Stats
  const stats = {
    total: comunicados.length,
    activos: comunicados.filter(c => c.activo).length,
    destacados: comunicados.filter(c => c.destacado).length,
    inactivos: comunicados.filter(c => !c.activo).length,
  }

  return (
    <>
      <Head>
        <title>Comunicados | Panel Municipal</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper
            p="xl"
            radius="xl"
            mb="xl"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />

            <Group justify="space-between" style={{ position: 'relative', zIndex: 1 }}>
              <Group gap="lg">
                <ThemeIcon size={60} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconSpeakerphone size={32} />
                </ThemeIcon>
                <Box>
                  <Title order={2} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Comunicados
                  </Title>
                  <Text opacity={0.9} size="lg">
                    Publica avisos para la ciudadanía
                  </Text>
                </Box>
              </Group>
              <Button
                leftSection={<IconPlus size={18} />}
                variant="white"
                color="dark"
                size="md"
                radius="xl"
                onClick={() => abrirModal()}
              >
                Nuevo Comunicado
              </Button>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={4} mt="xl">
              {[
                { label: 'Total', value: stats.total, color: 'white' },
                { label: 'Activos', value: stats.activos, color: '#bbf7d0' },
                { label: 'Destacados', value: stats.destacados, color: '#fde68a' },
                { label: 'Inactivos', value: stats.inactivos, color: '#fecaca' },
              ].map((stat) => (
                <Paper
                  key={stat.label}
                  p="sm"
                  radius="lg"
                  style={{ background: 'rgba(255,255,255,0.15)', textAlign: 'center' }}
                >
                  <Text size="xl" fw={800} style={{ color: stat.color }}>{stat.value}</Text>
                  <Text size="xs" c="white" opacity={0.8}>{stat.label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Tabs */}
          <Tabs value={tabActiva} onChange={setTabActiva} radius="lg" mb="lg">
            <Tabs.List grow>
              <Tabs.Tab value="todos" leftSection={<IconSpeakerphone size={16} />}>
                Todos ({stats.total})
              </Tabs.Tab>
              <Tabs.Tab value="activos" leftSection={<IconCheck size={16} />} color="green">
                Activos ({stats.activos})
              </Tabs.Tab>
              <Tabs.Tab value="destacados" leftSection={<IconStar size={16} />} color="orange">
                Destacados ({stats.destacados})
              </Tabs.Tab>
              <Tabs.Tab value="inactivos" leftSection={<IconX size={16} />} color="gray">
                Inactivos ({stats.inactivos})
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Lista */}
          {loading ? (
            <Center py="xl"><Loader size="lg" /></Center>
          ) : comunicadosFiltrados.length === 0 ? (
            <Paper p="xl" radius="xl" withBorder ta="center">
              <ThemeIcon size={80} radius="xl" color="gray" variant="light" mx="auto" mb="md">
                <IconSpeakerphone size={40} />
              </ThemeIcon>
              <Title order={3} c="dimmed">No hay comunicados</Title>
              <Text c="dimmed" size="sm" mb="md">Crea el primer comunicado</Text>
              <Button onClick={() => abrirModal()} leftSection={<IconPlus size={16} />}>
                Crear Comunicado
              </Button>
            </Paper>
          ) : (
            <Stack gap="md">
              {comunicadosFiltrados.map((comunicado) => {
                const tipoInfo = getTipoInfo(comunicado.tipo)
                const TipoIcon = tipoInfo.icon

                return (
                  <Card key={comunicado.id} radius="xl" withBorder padding={0} style={{ overflow: 'hidden' }}>
                    <Group wrap="nowrap" gap={0}>
                      {/* Imagen o icono */}
                      {comunicado.imagen_url ? (
                        <Box style={{ width: 200, minHeight: 150 }}>
                          <Image src={comunicado.imagen_url} height={150} width={200} fit="cover" />
                        </Box>
                      ) : (
                        <Box
                          style={{
                            width: 200,
                            minHeight: 150,
                            background: `linear-gradient(135deg, var(--mantine-color-${tipoInfo.color}-6) 0%, var(--mantine-color-${tipoInfo.color}-8) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TipoIcon size={50} color="white" opacity={0.9} />
                        </Box>
                      )}

                      {/* Contenido */}
                      <Box p="lg" style={{ flex: 1 }}>
                        <Group justify="space-between" mb="xs">
                          <Group gap="xs">
                            <Badge color={tipoInfo.color}>{tipoInfo.label}</Badge>
                            {comunicado.destacado && (
                              <Badge color="orange" leftSection={<IconStar size={10} />}>Destacado</Badge>
                            )}
                            <Badge color={comunicado.activo ? 'green' : 'gray'} variant="light">
                              {comunicado.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </Group>
                          <Group gap="xs">
                            <Tooltip label={comunicado.destacado ? 'Quitar destacado' : 'Destacar'}>
                              <ActionIcon
                                variant="light"
                                color={comunicado.destacado ? 'orange' : 'gray'}
                                onClick={() => toggleDestacado(comunicado)}
                              >
                                <IconStar size={16} fill={comunicado.destacado ? '#f59e0b' : 'none'} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={comunicado.activo ? 'Desactivar' : 'Activar'}>
                              <ActionIcon
                                variant="light"
                                color={comunicado.activo ? 'green' : 'gray'}
                                onClick={() => toggleActivo(comunicado)}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Vista previa">
                              <ActionIcon variant="light" onClick={() => setVistaPrevia(comunicado)}>
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Editar">
                              <ActionIcon variant="light" color="blue" onClick={() => abrirModal(comunicado)}>
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Eliminar">
                              <ActionIcon variant="light" color="red" onClick={() => eliminarComunicado(comunicado.id)}>
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <Text fw={700} size="lg" lineClamp={1}>{comunicado.titulo}</Text>
                        <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                          {comunicado.contenido}
                        </Text>

                        <Group gap="md" mt="sm">
                          <Text size="xs" c="dimmed">
                            <IconClock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {formatFecha(comunicado.fecha_publicacion || comunicado.created_at)}
                          </Text>
                        </Group>
                      </Box>
                    </Group>
                  </Card>
                )
              })}
            </Stack>
          )}
        </Container>

        {/* Modal crear/editar */}
        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            <Group gap="sm">
              <ThemeIcon size={36} radius="xl" color="violet">
                <IconSpeakerphone size={20} />
              </ThemeIcon>
              <Text fw={700} size="lg">{editando ? 'Editar Comunicado' : 'Nuevo Comunicado'}</Text>
            </Group>
          }
          size="lg"
          radius="lg"
          centered
          zIndex={1000}
        >
          <form onSubmit={form.onSubmit(guardarComunicado)}>
            <Stack>
              <TextInput
                label="Título del Comunicado"
                placeholder="Escribe un título..."
                required
                radius="lg"
                {...form.getInputProps('titulo')}
              />

              <Select
                label="Tipo de Comunicado"
                data={TIPOS_COMUNICADO.map(t => ({ value: t.value, label: t.label }))}
                radius="lg"
                {...form.getInputProps('tipo')}
              />

              <Textarea
                label="Contenido"
                placeholder="Escribe el contenido..."
                minRows={5}
                required
                radius="lg"
                {...form.getInputProps('contenido')}
              />

              {/* Subida de imagen SIMPLE */}
              <Box>
                <Text size="sm" fw={500} mb="xs">Imagen (opcional, máx 2MB)</Text>
                
                {imagenPreview ? (
                  <Box style={{ position: 'relative' }}>
                    <Image src={imagenPreview} radius="lg" mah={200} fit="cover" />
                    <ActionIcon
                      variant="filled"
                      color="red"
                      radius="xl"
                      size="sm"
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={eliminarImagen}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Box>
                ) : (
                  <FileInput
                    placeholder="Seleccionar imagen..."
                    accept="image/png,image/jpeg,image/webp"
                    leftSection={<IconPhoto size={16} />}
                    onChange={handleImagenSelect}
                    radius="lg"
                  />
                )}
              </Box>

              <Group grow>
                <Switch
                  label="Publicar activo"
                  description="Visible para ciudadanos"
                  checked={form.values.activo}
                  onChange={(e) => form.setFieldValue('activo', e.currentTarget.checked)}
                  color="green"
                />
                <Switch
                  label="Destacar"
                  description="Mostrar primero"
                  checked={form.values.destacado}
                  onChange={(e) => form.setFieldValue('destacado', e.currentTarget.checked)}
                  color="orange"
                />
              </Group>

              <Button
                type="submit"
                loading={guardando}
                color="violet"
                radius="lg"
                size="md"
                leftSection={editando ? <IconCheck size={18} /> : <IconSpeakerphone size={18} />}
              >
                {editando ? 'Actualizar Comunicado' : 'Publicar Comunicado'}
              </Button>
            </Stack>
          </form>
        </Modal>

        {/* Modal vista previa */}
        <Modal
          opened={!!vistaPrevia}
          onClose={() => setVistaPrevia(null)}
          title="Vista Previa"
          size="lg"
          radius="lg"
          centered
          zIndex={1000}
        >
          {vistaPrevia && (
            <Stack>
              {vistaPrevia.imagen_url && (
                <Image src={vistaPrevia.imagen_url} radius="lg" mah={250} fit="cover" />
              )}
              <Group gap="xs">
                <Badge color={getTipoInfo(vistaPrevia.tipo).color}>
                  {getTipoInfo(vistaPrevia.tipo).label}
                </Badge>
                {vistaPrevia.destacado && <Badge color="orange">Destacado</Badge>}
              </Group>
              <Title order={3}>{vistaPrevia.titulo}</Title>
              <Text size="sm" c="dimmed">
                Publicado: {formatFecha(vistaPrevia.fecha_publicacion || vistaPrevia.created_at)}
              </Text>
              <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
                <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {vistaPrevia.contenido}
                </Text>
              </Paper>
              <Button variant="light" color="gray" onClick={() => setVistaPrevia(null)}>
                Cerrar
              </Button>
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(ComunicadosMunicipal, { allowedRoles: ['municipal', 'admin'] })