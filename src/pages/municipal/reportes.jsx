// ============================================
// REPORTES MUNICIPAL - Lista completa
// Archivo: src/pages/municipal/reportes.jsx
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
  Loader,
  Center,
  Table,
  Select,
  TextInput,
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  Stack,
  Image,
  Textarea,
  SimpleGrid,
  Pagination,
  Menu,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconFileDescription,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconEye,
  IconCheck,
  IconX,
  IconTool,
  IconTruck,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconDownload,
  IconDotsVertical,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ESTADOS = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: IconFileDescription },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: IconEye },
  asignado: { label: 'Asignado', color: 'violet', icon: IconTruck },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: IconTool },
  resuelto: { label: 'Resuelto', color: 'green', icon: IconCheck },
  rechazado: { label: 'Rechazado', color: 'red', icon: IconX },
}

const PRIORIDADES = {
  baja: { label: 'Baja', color: 'green' },
  media: { label: 'Media', color: 'blue' },
  alta: { label: 'Alta', color: 'orange' },
  critica: { label: 'Crítica', color: 'red' },
}

const ITEMS_PER_PAGE = 15

function ReportesMunicipal() {
  const { user, profile } = useAuth()
  const [reportes, setReportes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [comentario, setComentario] = useState('')
  const [actualizando, setActualizando] = useState(false)

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      const { data } = await supabase.from('categorias').select('*')
      setCategorias(data || [])
    }
    cargarCategorias()
  }, [])

  // Cargar reportes
  const cargarReportes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtroEstado) query = query.eq('estado', filtroEstado)
      if (filtroPrioridad) query = query.eq('prioridad', filtroPrioridad)
      if (filtroCategoria) query = query.eq('categoria_id', filtroCategoria)

      const { data: reportesData, error } = await query

      if (error) throw error

      // Obtener categorías y usuarios
      const { data: cats } = await supabase.from('categorias').select('*')
      const { data: users } = await supabase.from('usuarios').select('*')

      const reportesCompletos = (reportesData || []).map(r => ({
        ...r,
        categoria: cats?.find(c => c.id === r.categoria_id),
        usuario: users?.find(u => u.id === r.usuario_id),
      }))

      setReportes(reportesCompletos)
    } catch (error) {
      console.error('Error:', error)
      notifications.show({ title: 'Error', message: 'No se pudieron cargar los reportes', color: 'red' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [filtroEstado, filtroPrioridad, filtroCategoria])

  // Filtrar por búsqueda
  const reportesFiltrados = reportes.filter(r => {
    if (!busqueda) return true
    const texto = busqueda.toLowerCase()
    return (
      r.codigo?.toLowerCase().includes(texto) ||
      r.descripcion?.toLowerCase().includes(texto) ||
      r.direccion?.toLowerCase().includes(texto)
    )
  })

  // Paginación
  const totalPages = Math.ceil(reportesFiltrados.length / ITEMS_PER_PAGE)
  const reportesPaginados = reportesFiltrados.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // Ver detalle
  const verDetalle = (reporte) => {
    setSelectedReporte(reporte)
    setNuevoEstado(reporte.estado)
    setComentario('')
    setModalOpen(true)
  }

  // Actualizar estado
  const actualizarEstado = async () => {
    if (!selectedReporte || nuevoEstado === selectedReporte.estado) return

    setActualizando(true)
    try {
      await supabase
        .from('reportes')
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq('id', selectedReporte.id)

      await supabase.from('historial_estados').insert({
        reporte_id: selectedReporte.id,
        estado_anterior: selectedReporte.estado,
        estado_nuevo: nuevoEstado,
        comentario: comentario || `Estado cambiado a ${ESTADOS[nuevoEstado]?.label}`,
        usuario_id: user?.id,
      })

      notifications.show({
        title: 'Actualizado',
        message: `Reporte ${selectedReporte.codigo} actualizado`,
        color: 'green',
      })

      setModalOpen(false)
      cargarReportes()
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar', color: 'red' })
    } finally {
      setActualizando(false)
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

  return (
    <>
      <Head>
        <title>Todos los Reportes | Panel Municipal</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper p="lg" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white' }}>
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconFileDescription size={28} />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Todos los Reportes</Title>
                  <Text opacity={0.9}>Gestión completa de reportes ciudadanos</Text>
                </Box>
              </Group>
              <Badge size="xl" variant="white" color="dark">
                {reportesFiltrados.length} reportes
              </Badge>
            </Group>
          </Paper>

          {/* Filtros */}
          <Paper p="md" radius="lg" mb="lg" withBorder>
            <Group gap="md" grow>
              <TextInput
                placeholder="Buscar por código, descripción..."
                leftSection={<IconSearch size={16} />}
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
              />
              <Select
                placeholder="Estado"
                clearable
                value={filtroEstado}
                onChange={(v) => { setFiltroEstado(v); setPage(1) }}
                data={Object.entries(ESTADOS).map(([k, v]) => ({ value: k, label: v.label }))}
                leftSection={<IconFilter size={16} />}
              />
              <Select
                placeholder="Prioridad"
                clearable
                value={filtroPrioridad}
                onChange={(v) => { setFiltroPrioridad(v); setPage(1) }}
                data={Object.entries(PRIORIDADES).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Select
                placeholder="Categoría"
                clearable
                value={filtroCategoria}
                onChange={(v) => { setFiltroCategoria(v); setPage(1) }}
                data={categorias.map(c => ({ value: c.id, label: c.nombre }))}
              />
              <Button leftSection={<IconRefresh size={16} />} onClick={cargarReportes} loading={loading}>
                Actualizar
              </Button>
            </Group>
          </Paper>

          {/* Tabla */}
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            {loading ? (
              <Center py="xl"><Loader /></Center>
            ) : reportesPaginados.length === 0 ? (
              <Center py="xl">
                <Box ta="center">
                  <IconFileDescription size={48} color="#94a3b8" />
                  <Text c="dimmed" mt="md">No se encontraron reportes</Text>
                </Box>
              </Center>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Código</Table.Th>
                    <Table.Th>Categoría</Table.Th>
                    <Table.Th>Descripción</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Prioridad</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reportesPaginados.map((reporte) => {
                    const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
                    const prioridad = PRIORIDADES[reporte.prioridad] || PRIORIDADES.media
                    return (
                      <Table.Tr key={reporte.id}>
                        <Table.Td>
                          <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
                            {reporte.codigo}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge style={{ background: reporte.categoria?.color || '#64748b' }}>
                            {reporte.categoria?.nombre || 'Sin categoría'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1} style={{ maxWidth: 200 }}>
                            {reporte.descripcion}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={estado.color}>{estado.label}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={prioridad.color} variant="light">{prioridad.label}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{formatFecha(reporte.created_at)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip label="Ver detalle">
                              <ActionIcon variant="light" color="blue" onClick={() => verDetalle(reporte)}>
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <Group justify="center" py="md">
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Group>
            )}
          </Paper>
        </Container>

        {/* Modal */}
        <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Detalle del Reporte" size="lg">
          {selectedReporte && (
            <Stack>
              {selectedReporte.foto_url && (
                <Image src={selectedReporte.foto_url} radius="md" mah={200} fit="contain" />
              )}
              <SimpleGrid cols={2}>
                <Box>
                  <Text size="xs" c="dimmed">Código</Text>
                  <Text fw={600}>{selectedReporte.codigo}</Text>
                </Box>
                <Box>
                  <Text size="xs" c="dimmed">Estado</Text>
                  <Badge color={ESTADOS[selectedReporte.estado]?.color}>
                    {ESTADOS[selectedReporte.estado]?.label}
                  </Badge>
                </Box>
              </SimpleGrid>
              <Box>
                <Text size="xs" c="dimmed">Descripción</Text>
                <Text>{selectedReporte.descripcion}</Text>
              </Box>
              {selectedReporte.direccion && (
                <Box>
                  <Text size="xs" c="dimmed">Dirección</Text>
                  <Text>{selectedReporte.direccion}</Text>
                </Box>
              )}
              <Select
                label="Cambiar estado"
                value={nuevoEstado}
                onChange={setNuevoEstado}
                data={Object.entries(ESTADOS).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Textarea
                label="Comentario"
                placeholder="Agregar comentario..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
              <Button onClick={actualizarEstado} loading={actualizando} color="green">
                Guardar Cambios
              </Button>
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(ReportesMunicipal, { allowedRoles: ['municipal', 'admin'] })
