import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Grid,
  Card,
  Image,
  Badge,
  Button,
  TextInput,
  Select,
  Box,
  ThemeIcon,
  Loader,
  Center,
  Modal,
  Timeline,
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconMapPin,
  IconCalendar,
  IconFileDescription,
  IconInbox,
  IconRoadOff,
  IconBulbOff,
  IconTrash,
  IconDroplet,
  IconAlertTriangle,
  IconTree,
  IconBuilding,
  IconDots,
  IconEye,
  IconClock,
  IconCheck,
  IconX,
  IconTruck,
  IconTool,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mapeo de iconos
const ICONOS = {
  'IconRoadOff': IconRoadOff,
  'IconBulbOff': IconBulbOff,
  'IconTrash': IconTrash,
  'IconDroplet': IconDroplet,
  'IconAlertTriangle': IconAlertTriangle,
  'IconTree': IconTree,
  'IconBuilding': IconBuilding,
  'IconDots': IconDots,
}

// Estados
const ESTADOS = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: IconFileDescription },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: IconEye },
  asignado: { label: 'Asignado', color: 'violet', icon: IconTruck },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: IconTool },
  resuelto: { label: 'Resuelto', color: 'green', icon: IconCheck },
  rechazado: { label: 'Rechazado', color: 'red', icon: IconX },
}

function ReportesPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Cargar reportes REALES del usuario
  useEffect(() => {
    const cargarReportes = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('reportes')
          .select(`
            *,
            categoria:categorias(id, nombre, icono, color)
          `)
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setReportes(data || [])
      } catch (error) {
        console.error('Error cargando reportes:', error)
        setReportes([])
      } finally {
        setLoading(false)
      }
    }

    cargarReportes()
  }, [user])

  // Cargar historial cuando se selecciona un reporte
  const verDetalle = async (reporte) => {
    try {
      const { data: historial, error } = await supabase
        .from('historial_estados')
        .select('*')
        .eq('reporte_id', reporte.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setSelectedReporte({ ...reporte, historial: historial || [] })
      setModalOpen(true)
    } catch (error) {
      console.error('Error cargando historial:', error)
      setSelectedReporte({ ...reporte, historial: [] })
      setModalOpen(true)
    }
  }

  // Filtrar reportes
  const reportesFiltrados = reportes.filter((r) => {
    const matchSearch = !search || 
      r.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      r.direccion?.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !estadoFilter || r.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <Head>
        <title>Mis Reportes | Willay Map</title>
      </Head>

      <DashboardLayout user={profile} title="Mis Reportes">
        <Container size="xl" py="md">
          {/* Header */}
          <Paper
            p="xl"
            mb="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <Group justify="space-between">
              <Group gap="md">
                <ThemeIcon size={50} radius="xl" color="white" variant="white">
                  <IconFileDescription size={28} color="#10b981" />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Mis Reportes</Title>
                  <Text opacity={0.9}>{reportes.length} reportes creados</Text>
                </Box>
              </Group>
              <Button
                variant="white"
                color="dark"
                leftSection={<IconPlus size={18} />}
                onClick={() => router.push('/ciudadano/nuevo-reporte')}
              >
                Nuevo Reporte
              </Button>
            </Group>
          </Paper>

          {/* Filtros */}
          <Paper p="md" radius="lg" mb="xl" withBorder>
            <Group gap="md">
              <TextInput
                placeholder="Buscar por código, descripción o dirección..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, maxWidth: 400 }}
              />
              <Select
                placeholder="Filtrar por estado"
                data={[
                  { value: '', label: 'Todos los estados' },
                  ...Object.entries(ESTADOS).map(([key, val]) => ({
                    value: key,
                    label: val.label,
                  })),
                ]}
                value={estadoFilter}
                onChange={setEstadoFilter}
                clearable
                style={{ minWidth: 180 }}
              />
            </Group>
          </Paper>

          {/* Lista de reportes */}
          {loading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : reportesFiltrados.length === 0 ? (
            <Paper p="xl" radius="lg" ta="center" withBorder>
              <ThemeIcon size={60} radius="xl" color="gray" variant="light">
                <IconInbox size={30} />
              </ThemeIcon>
              <Text size="lg" fw={500} c="dimmed" mt="md">
                {reportes.length === 0 ? 'No tienes reportes aún' : 'No se encontraron resultados'}
              </Text>
              {reportes.length === 0 && (
                <Button mt="md" onClick={() => router.push('/ciudadano/nuevo-reporte')}>
                  Crear mi primer reporte
                </Button>
              )}
            </Paper>
          ) : (
            <Grid>
              {reportesFiltrados.map((reporte) => {
                const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
                const IconCategoria = ICONOS[reporte.categoria?.icono] || IconDots
                const EstadoIcon = estado.icon

                return (
                  <Grid.Col key={reporte.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card 
                      padding="lg" 
                      radius="lg" 
                      withBorder
                      style={{ cursor: 'pointer' }}
                      onClick={() => verDetalle(reporte)}
                    >
                      <Card.Section>
                        <Box style={{ position: 'relative' }}>
                          <Image
                            src={reporte.foto_url}
                            height={160}
                            fallbackSrc="https://placehold.co/400x200?text=Sin+foto"
                          />
                          <Badge
                            style={{ 
                              position: 'absolute', 
                              top: 10, 
                              left: 10, 
                              background: reporte.categoria?.color || '#64748b' 
                            }}
                          >
                            {reporte.categoria?.nombre || 'Sin categoría'}
                          </Badge>
                          <Badge
                            style={{ position: 'absolute', top: 10, right: 10 }}
                            color={estado.color}
                            leftSection={<EstadoIcon size={12} />}
                          >
                            {estado.label}
                          </Badge>
                        </Box>
                      </Card.Section>

                      <Stack gap="xs" mt="md">
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed" fw={600}>{reporte.codigo}</Text>
                        </Group>
                        <Text fw={600} lineClamp={2}>{reporte.descripcion}</Text>
                        
                        {reporte.direccion && (
                          <Group gap="xs">
                            <IconMapPin size={14} color="#64748b" />
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {reporte.direccion}
                            </Text>
                          </Group>
                        )}
                        
                        <Group gap="xs">
                          <IconCalendar size={14} color="#64748b" />
                          <Text size="xs" c="dimmed">{formatFechaCorta(reporte.created_at)}</Text>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                )
              })}
            </Grid>
          )}
        </Container>

        {/* Modal de detalle */}
        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            <Group gap="sm">
              <IconFileDescription size={20} />
              <Text fw={600}>Detalle del Reporte</Text>
            </Group>
          }
          size="lg"
        >
          {selectedReporte && (
            <Stack gap="md">
              {/* Foto */}
              {selectedReporte.foto_url && (
                <Image
                  src={selectedReporte.foto_url}
                  radius="md"
                  mah={250}
                  fit="contain"
                />
              )}

              {/* Info básica */}
              <Paper p="md" radius="md" bg="gray.0">
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Código</Text>
                    <Text fw={600}>{selectedReporte.codigo}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Estado</Text>
                    <Badge color={ESTADOS[selectedReporte.estado]?.color}>
                      {ESTADOS[selectedReporte.estado]?.label}
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Categoría</Text>
                    <Badge style={{ background: selectedReporte.categoria?.color }}>
                      {selectedReporte.categoria?.nombre}
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Fecha de creación</Text>
                    <Text size="sm">{formatFecha(selectedReporte.created_at)}</Text>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Descripción */}
              <Box>
                <Text size="xs" c="dimmed" mb="xs">Descripción</Text>
                <Text>{selectedReporte.descripcion}</Text>
              </Box>

              {/* Ubicación */}
              {selectedReporte.direccion && (
                <Box>
                  <Text size="xs" c="dimmed" mb="xs">Ubicación</Text>
                  <Group gap="xs">
                    <IconMapPin size={16} color="#3b82f6" />
                    <Text size="sm">{selectedReporte.direccion}</Text>
                  </Group>
                </Box>
              )}

              {/* Coordenadas */}
              <Box>
                <Text size="xs" c="dimmed" mb="xs">Coordenadas</Text>
                <Text size="sm" c="dimmed">
                  {selectedReporte.latitud?.toFixed(6)}, {selectedReporte.longitud?.toFixed(6)}
                </Text>
              </Box>

              {/* Historial */}
              {selectedReporte.historial && selectedReporte.historial.length > 0 && (
                <Box>
                  <Text size="xs" c="dimmed" mb="md">Historial de estados</Text>
                  <Timeline active={selectedReporte.historial.length - 1} bulletSize={24} lineWidth={2}>
                    {selectedReporte.historial.map((h, index) => {
                      const estadoInfo = ESTADOS[h.estado_nuevo] || ESTADOS.nuevo
                      const EstadoIcon = estadoInfo.icon
                      return (
                        <Timeline.Item
                          key={h.id || index}
                          bullet={<EstadoIcon size={12} />}
                          title={estadoInfo.label}
                          color={estadoInfo.color}
                        >
                          <Text size="xs" c="dimmed">{formatFecha(h.created_at)}</Text>
                          {h.comentario && (
                            <Text size="sm" mt="xs">{h.comentario}</Text>
                          )}
                        </Timeline.Item>
                      )
                    })}
                  </Timeline>
                </Box>
              )}
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(ReportesPage, { allowedRoles: ['ciudadano'] })