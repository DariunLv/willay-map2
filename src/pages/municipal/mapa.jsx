// ============================================
// MAPA MUNICIPAL - Pantalla completa
// Archivo: src/pages/municipal/mapa.jsx
// ============================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import {
  Box,
  Paper,
  Text,
  Group,
  Badge,
  Select,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Modal,
  Stack,
  Image,
  Button,
  Textarea,
  SimpleGrid,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconFilter,
  IconRefresh,
  IconX,
  IconCheck,
  IconEye,
  IconTool,
  IconTruck,
  IconFileDescription,
  IconCurrentLocation,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Mapa dinámico
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

const ESTADOS = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: IconFileDescription },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: IconEye },
  asignado: { label: 'Asignado', color: 'violet', icon: IconTruck },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: IconTool },
  resuelto: { label: 'Resuelto', color: 'green', icon: IconCheck },
  rechazado: { label: 'Rechazado', color: 'red', icon: IconX },
}

const PRIORIDADES = {
  baja: { label: 'Baja', color: '#10b981' },
  media: { label: 'Media', color: '#3b82f6' },
  alta: { label: 'Alta', color: '#f59e0b' },
  critica: { label: 'Crítica', color: '#ef4444' },
}

const PUNO_CENTER = [-15.8402, -70.0219]

function MapaMunicipalPage() {
  const { user, profile } = useAuth()
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [comentario, setComentario] = useState('')
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => {
    setMapReady(true)
  }, [])

  const cargarReportes = async () => {
    setLoading(true)
    try {
      let query = supabase.from('reportes').select('*').order('created_at', { ascending: false })

      if (filtroEstado) query = query.eq('estado', filtroEstado)
      if (filtroPrioridad) query = query.eq('prioridad', filtroPrioridad)

      const { data: reportesData } = await query
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [filtroEstado, filtroPrioridad])

  const verDetalle = (reporte) => {
    setSelectedReporte(reporte)
    setNuevoEstado(reporte.estado)
    setComentario('')
    setModalOpen(true)
  }

  const actualizarEstado = async () => {
    if (!selectedReporte || nuevoEstado === selectedReporte.estado) return

    setActualizando(true)
    try {
      await supabase
        .from('reportes')
        .update({ estado: nuevoEstado })
        .eq('id', selectedReporte.id)

      await supabase.from('historial_estados').insert({
        reporte_id: selectedReporte.id,
        estado_anterior: selectedReporte.estado,
        estado_nuevo: nuevoEstado,
        comentario: comentario || `Estado cambiado a ${ESTADOS[nuevoEstado]?.label}`,
        usuario_id: user?.id,
      })

      notifications.show({ title: 'Actualizado', message: 'Reporte actualizado', color: 'green' })
      setModalOpen(false)
      cargarReportes()
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo actualizar', color: 'red' })
    } finally {
      setActualizando(false)
    }
  }

  const reportesConUbicacion = reportes.filter(r => r.latitud && r.longitud)

  // Crear icono
  const crearIcono = (color) => {
    if (typeof window === 'undefined') return null
    const L = require('leaflet')
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:24px;height:24px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  return (
    <>
      <Head>
        <title>Mapa de Reportes | Panel Municipal</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      </Head>

      <DashboardLayout user={profile}>
        <Box style={{ height: 'calc(100vh - 100px)', position: 'relative' }}>
          {/* Filtros flotantes */}
          <Paper
            p="sm"
            radius="lg"
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1000,
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <Group gap="sm">
              <Select
                placeholder="Estado"
                clearable
                size="sm"
                value={filtroEstado}
                onChange={setFiltroEstado}
                data={Object.entries(ESTADOS).map(([k, v]) => ({ value: k, label: v.label }))}
                leftSection={<IconFilter size={14} />}
                style={{ width: 150 }}
              />
              <Select
                placeholder="Prioridad"
                clearable
                size="sm"
                value={filtroPrioridad}
                onChange={setFiltroPrioridad}
                data={Object.entries(PRIORIDADES).map(([k, v]) => ({ value: k, label: v.label }))}
                style={{ width: 130 }}
              />
              <Tooltip label="Actualizar">
                <ActionIcon variant="light" onClick={cargarReportes} loading={loading}>
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>

          {/* Contador */}
          <Paper
            p="sm"
            radius="lg"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <Text fw={700}>{reportesConUbicacion.length} reportes en mapa</Text>
          </Paper>

          {/* Mapa */}
          {mapReady ? (
            <MapContainer center={PUNO_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reportesConUbicacion.map((reporte) => {
                const icono = crearIcono(reporte.categoria?.color || '#3b82f6')
                if (!icono) return null
                return (
                  <Marker
                    key={reporte.id}
                    position={[reporte.latitud, reporte.longitud]}
                    icon={icono}
                    eventHandlers={{ click: () => verDetalle(reporte) }}
                  >
                    <Popup>
                      <Box style={{ minWidth: 200 }}>
                        <Text fw={700} size="sm">{reporte.categoria?.nombre || 'Sin categoría'}</Text>
                        <Text size="xs" c="dimmed" lineClamp={2}>{reporte.descripcion}</Text>
                        <Badge size="xs" color={ESTADOS[reporte.estado]?.color} mt="xs">
                          {ESTADOS[reporte.estado]?.label}
                        </Badge>
                      </Box>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          ) : (
            <Center h="100%"><Loader /></Center>
          )}
        </Box>

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
              <Select
                label="Cambiar estado"
                value={nuevoEstado}
                onChange={setNuevoEstado}
                data={Object.entries(ESTADOS).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Textarea
                label="Comentario"
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

      <style jsx global>{`
        .custom-marker { background: transparent !important; border: none !important; }
      `}</style>
    </>
  )
}

export default withAuth(MapaMunicipalPage, { allowedRoles: ['municipal', 'admin'] })
