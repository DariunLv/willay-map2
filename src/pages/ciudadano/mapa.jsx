// ============================================================================
// WILLAY MAP - Página Mapa Público
// Visualización de todos los reportes ciudadanos
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import {
  Container,
  Paper,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Button,
  ActionIcon,
  Drawer,
  Box,
  Image,
  SegmentedControl,
  Chip,
  Divider,
  ThemeIcon,
  Tooltip,
  Loader,
  Modal,
  Timeline,
  RingProgress,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconMap,
  IconFilter,
  IconX,
  IconMapPin,
  IconCalendar,
  IconThumbUp,
  IconEye,
  IconChevronRight,
  IconCurrentLocation,
  IconLayersLinked,
  IconFlame,
  IconList,
  IconRefresh,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { reportesService, CATEGORIAS_REPORTE, ESTADOS_REPORTE, PRIORIDADES } from '@/lib/supabase'

// Importar mapa dinámicamente (sin SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
)

// Datos de ejemplo
const reportesEjemplo = [
  {
    id: '1',
    codigo: 'RPT-20250106-0001',
    categoria: 'bache',
    descripcion: 'Bache profundo en la esquina, peligroso para vehículos',
    latitud: -15.8402,
    longitud: -70.0219,
    direccion_texto: 'Jr. Lima 234, Puno',
    estado: 'en_proceso',
    prioridad: 'alta',
    votos_apoyo: 15,
    fecha_creacion: '2025-01-03T10:30:00Z',
    fotos_urls: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400'],
  },
  {
    id: '2',
    codigo: 'RPT-20250106-0002',
    categoria: 'alumbrado',
    descripcion: 'Poste de luz sin funcionar hace 2 semanas',
    latitud: -15.8380,
    longitud: -70.0250,
    direccion_texto: 'Av. El Sol 456, Puno',
    estado: 'nuevo',
    prioridad: 'media',
    votos_apoyo: 8,
    fecha_creacion: '2025-01-05T14:20:00Z',
    fotos_urls: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  },
  {
    id: '3',
    codigo: 'RPT-20250106-0003',
    categoria: 'basura',
    descripcion: 'Acumulación de basura en la esquina del parque',
    latitud: -15.8420,
    longitud: -70.0180,
    direccion_texto: 'Jr. Arequipa con Jr. Tacna',
    estado: 'asignado',
    prioridad: 'alta',
    votos_apoyo: 23,
    fecha_creacion: '2025-01-04T08:15:00Z',
    fotos_urls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400'],
  },
  {
    id: '4',
    codigo: 'RPT-20250106-0004',
    categoria: 'agua_alcantarillado',
    descripcion: 'Fuga de agua en la tubería principal',
    latitud: -15.8350,
    longitud: -70.0200,
    direccion_texto: 'Av. Floral 789, Puno',
    estado: 'resuelto',
    prioridad: 'critica',
    votos_apoyo: 45,
    fecha_creacion: '2025-01-02T16:45:00Z',
    fotos_urls: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400'],
  },
  {
    id: '5',
    codigo: 'RPT-20250106-0005',
    categoria: 'senalizacion',
    descripcion: 'Señal de tránsito caída',
    latitud: -15.8390,
    longitud: -70.0230,
    direccion_texto: 'Jr. Puno 123, Puno',
    estado: 'en_revision',
    prioridad: 'media',
    votos_apoyo: 5,
    fecha_creacion: '2025-01-06T09:00:00Z',
    fotos_urls: ['https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=400'],
  },
]

// Centro de Puno
const PUNO_CENTER = [-15.8402, -70.0219]

function MapaPublicoPage() {
  const { profile, user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  const [reportes, setReportes] = useState(reportesEjemplo)
  const [filteredReportes, setFilteredReportes] = useState(reportesEjemplo)
  const [loading, setLoading] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [vistaActiva, setVistaActiva] = useState('marcadores')
  const [mapReady, setMapReady] = useState(false)
  
  // Filtros
  const [filtrosOpened, { open: openFiltros, close: closeFiltros }] = useDisclosure(false)
  const [categoriasActivas, setCategoriasActivas] = useState([])
  const [estadosActivos, setEstadosActivos] = useState([])
  const [prioridadesActivas, setPrioridadesActivas] = useState([])
  
  // Modal de detalle
  const [detalleOpened, { open: openDetalle, close: closeDetalle }] = useDisclosure(false)

  // Cargar CSS de Leaflet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css')
      setMapReady(true)
    }
  }, [])

  // Cargar reportes reales
  useEffect(() => {
    const cargarReportes = async () => {
      setLoading(true)
      try {
        const { data, error } = await reportesService.getReportesPublicos({
          limite: 500,
          categorias: categoriasActivas.length > 0 ? categoriasActivas : null,
          estados: estadosActivos.length > 0 ? estadosActivos : null,
        })
        if (data && data.length > 0) {
          setReportes(data)
        }
      } catch (error) {
        console.error('Error cargando reportes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    cargarReportes()
  }, [])

  // Filtrar reportes
  useEffect(() => {
    let filtered = [...reportes]

    if (categoriasActivas.length > 0) {
      filtered = filtered.filter(r => categoriasActivas.includes(r.categoria))
    }

    if (estadosActivos.length > 0) {
      filtered = filtered.filter(r => estadosActivos.includes(r.estado))
    }

    if (prioridadesActivas.length > 0) {
      filtered = filtered.filter(r => prioridadesActivas.includes(r.prioridad))
    }

    setFilteredReportes(filtered)
  }, [reportes, categoriasActivas, estadosActivos, prioridadesActivas])

  // Crear icono personalizado
  const createIcon = useCallback((categoria, prioridad) => {
    if (typeof window === 'undefined') return null
    
    const L = require('leaflet')
    const cat = CATEGORIAS_REPORTE[categoria] || CATEGORIAS_REPORTE.otros
    const prio = PRIORIDADES[prioridad] || PRIORIDADES.media

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 40px;
          height: 48px;
          position: relative;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: ${prio.color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 18px;
            ">${cat.emoji}</span>
          </div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    })
  }, [])

  // Manejar voto
  const handleVotar = async (reporteId) => {
    if (!user) return
    const { votado } = await reportesService.votarReporte(reporteId, user.id)
    // Actualizar estado local
    setReportes(prev =>
      prev.map(r =>
        r.id === reporteId
          ? { ...r, votos_apoyo: votado ? r.votos_apoyo + 1 : r.votos_apoyo - 1 }
          : r
      )
    )
  }

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = filteredReportes.length
    const resueltos = filteredReportes.filter(r => r.estado === 'resuelto').length
    const enProceso = filteredReportes.filter(r => ['en_revision', 'asignado', 'en_proceso'].includes(r.estado)).length
    const pendientes = filteredReportes.filter(r => r.estado === 'nuevo').length
    
    return { total, resueltos, enProceso, pendientes }
  }, [filteredReportes])

  // Formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setCategoriasActivas([])
    setEstadosActivos([])
    setPrioridadesActivas([])
  }

  const filtrosActivos = categoriasActivas.length + estadosActivos.length + prioridadesActivas.length

  return (
    <>
      <Head>
        <title>Mapa Público | Willay Map</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <DashboardLayout user={profile} title="Mapa Público">
        <Box style={{ height: 'calc(100vh - 140px)', position: 'relative' }}>
          {/* Panel superior */}
          <Paper
            p="md"
            radius="lg"
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="md">
                <ThemeIcon size={42} radius="md" variant="gradient" gradient={{ from: '#3b82f6', to: '#1d4ed8' }}>
                  <IconMap size={24} />
                </ThemeIcon>
                <Box>
                  <Title order={4}>Mapa de Reportes</Title>
                  <Text size="sm" c="dimmed">
                    {estadisticas.total} reportes en tu ciudad
                  </Text>
                </Box>
              </Group>

              <Group gap="sm">
                {/* Stats rápidos */}
                <Group gap="xs" visibleFrom="sm">
                  <Badge color="green" variant="light" size="lg">
                    ✅ {estadisticas.resueltos}
                  </Badge>
                  <Badge color="orange" variant="light" size="lg">
                    🔧 {estadisticas.enProceso}
                  </Badge>
                  <Badge color="blue" variant="light" size="lg">
                    📝 {estadisticas.pendientes}
                  </Badge>
                </Group>

                <Divider orientation="vertical" visibleFrom="sm" />

                {/* Vista */}
                <SegmentedControl
                  value={vistaActiva}
                  onChange={setVistaActiva}
                  data={[
                    { value: 'marcadores', label: <IconMapPin size={16} /> },
                    { value: 'calor', label: <IconFlame size={16} /> },
                  ]}
                  size="sm"
                />

                {/* Filtros */}
                <Button
                  variant={filtrosActivos > 0 ? 'filled' : 'light'}
                  leftSection={<IconFilter size={16} />}
                  onClick={openFiltros}
                  size="sm"
                >
                  Filtros {filtrosActivos > 0 && `(${filtrosActivos})`}
                </Button>

                <Tooltip label="Recargar">
                  <ActionIcon
                    variant="light"
                    size="lg"
                    loading={loading}
                    onClick={() => window.location.reload()}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>

          {/* Mapa */}
          {mapReady && (
            <MapContainer
              center={PUNO_CENTER}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {vistaActiva === 'marcadores' ? (
                // Marcadores normales
                filteredReportes.map((reporte) => {
                  const icon = createIcon(reporte.categoria, reporte.prioridad)
                  return icon ? (
                    <Marker
                      key={reporte.id}
                      position={[reporte.latitud, reporte.longitud]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
                          setSelectedReporte(reporte)
                          openDetalle()
                        },
                      }}
                    >
                      <Popup>
                        <Box style={{ minWidth: 200 }}>
                          <Text fw={600} size="sm" lineClamp={1}>
                            {CATEGORIAS_REPORTE[reporte.categoria]?.emoji} {reporte.descripcion}
                          </Text>
                          <Text size="xs" c="dimmed" mt={4}>
                            {reporte.direccion_texto}
                          </Text>
                          <Group gap="xs" mt="xs">
                            <Badge size="sm" color={PRIORIDADES[reporte.prioridad]?.color}>
                              {reporte.prioridad}
                            </Badge>
                            <Badge size="sm" variant="light">
                              {ESTADOS_REPORTE[reporte.estado]?.label}
                            </Badge>
                          </Group>
                        </Box>
                      </Popup>
                    </Marker>
                  ) : null
                })
              ) : (
                // Vista de calor (círculos)
                filteredReportes.map((reporte) => (
                  <CircleMarker
                    key={reporte.id}
                    center={[reporte.latitud, reporte.longitud]}
                    radius={15 + (reporte.votos_apoyo || 0) * 0.5}
                    fillColor={PRIORIDADES[reporte.prioridad]?.color || '#3b82f6'}
                    fillOpacity={0.6}
                    stroke={false}
                    eventHandlers={{
                      click: () => {
                        setSelectedReporte(reporte)
                        openDetalle()
                      },
                    }}
                  />
                ))
              )}
            </MapContainer>
          )}

          {/* Leyenda */}
          <Paper
            p="sm"
            radius="md"
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Text size="xs" fw={600} mb="xs">Prioridad</Text>
            <Stack gap={4}>
              {Object.entries(PRIORIDADES).map(([key, value]) => (
                <Group key={key} gap="xs">
                  <Box
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: value.color,
                    }}
                  />
                  <Text size="xs">{value.label}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* Botón mi ubicación */}
          <Tooltip label="Mi ubicación">
            <ActionIcon
              variant="filled"
              color="blue"
              size="xl"
              radius="xl"
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    // Centrar mapa en ubicación del usuario
                    console.log('Mi ubicación:', pos.coords)
                  })
                }
              }}
            >
              <IconCurrentLocation size={22} />
            </ActionIcon>
          </Tooltip>
        </Box>

        {/* Drawer de filtros */}
        <Drawer
          opened={filtrosOpened}
          onClose={closeFiltros}
          title={
            <Group justify="space-between" style={{ width: '100%' }}>
              <Text fw={600}>Filtros</Text>
              {filtrosActivos > 0 && (
                <Button variant="subtle" size="xs" onClick={limpiarFiltros}>
                  Limpiar todo
                </Button>
              )}
            </Group>
          }
          position="right"
          size="sm"
        >
          <Stack gap="xl">
            {/* Por categoría */}
            <Box>
              <Text fw={600} size="sm" mb="sm">Categoría</Text>
              <Chip.Group multiple value={categoriasActivas} onChange={setCategoriasActivas}>
                <Group gap="xs">
                  {Object.entries(CATEGORIAS_REPORTE).map(([key, value]) => (
                    <Chip key={key} value={key} size="sm" variant="filled">
                      {value.emoji} {value.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Box>

            {/* Por estado */}
            <Box>
              <Text fw={600} size="sm" mb="sm">Estado</Text>
              <Chip.Group multiple value={estadosActivos} onChange={setEstadosActivos}>
                <Group gap="xs">
                  {Object.entries(ESTADOS_REPORTE).map(([key, value]) => (
                    <Chip key={key} value={key} size="sm" variant="filled" color={value.color}>
                      {value.icon} {value.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Box>

            {/* Por prioridad */}
            <Box>
              <Text fw={600} size="sm" mb="sm">Prioridad</Text>
              <Chip.Group multiple value={prioridadesActivas} onChange={setPrioridadesActivas}>
                <Group gap="xs">
                  {Object.entries(PRIORIDADES).map(([key, value]) => (
                    <Chip key={key} value={key} size="sm" variant="filled" color={value.color}>
                      {value.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Box>

            <Divider />

            <Button fullWidth onClick={closeFiltros}>
              Aplicar filtros ({filteredReportes.length} resultados)
            </Button>
          </Stack>
        </Drawer>

        {/* Modal de detalle de reporte */}
        <Modal
          opened={detalleOpened}
          onClose={closeDetalle}
          size="lg"
          title={
            <Group gap="sm">
              <Text fw={600}>Detalle del Reporte</Text>
              <Badge variant="light">{selectedReporte?.codigo}</Badge>
            </Group>
          }
          radius="lg"
        >
          {selectedReporte && (
            <Stack gap="md">
              {/* Imagen */}
              <Image
                src={selectedReporte.fotos_urls?.[0]}
                height={200}
                radius="md"
                fallbackSrc="https://placehold.co/800x400?text=Sin+imagen"
              />

              {/* Categoría y prioridad */}
              <Group gap="xs">
                <Badge size="lg" style={{ background: CATEGORIAS_REPORTE[selectedReporte.categoria]?.color }}>
                  {CATEGORIAS_REPORTE[selectedReporte.categoria]?.emoji}{' '}
                  {CATEGORIAS_REPORTE[selectedReporte.categoria]?.label}
                </Badge>
                <Badge size="lg" color={PRIORIDADES[selectedReporte.prioridad]?.color}>
                  Prioridad {selectedReporte.prioridad}
                </Badge>
                <Badge size="lg" variant="light" color={ESTADOS_REPORTE[selectedReporte.estado]?.color}>
                  {ESTADOS_REPORTE[selectedReporte.estado]?.icon}{' '}
                  {ESTADOS_REPORTE[selectedReporte.estado]?.label}
                </Badge>
              </Group>

              {/* Descripción */}
              <Text>{selectedReporte.descripcion}</Text>

              <Divider />

              {/* Info */}
              <Group gap="xl">
                <Stack gap={4}>
                  <Group gap="xs">
                    <IconMapPin size={16} color="#3b82f6" />
                    <Text size="sm" fw={500}>Ubicación</Text>
                  </Group>
                  <Text size="sm" c="dimmed" pl={24}>
                    {selectedReporte.direccion_texto}
                  </Text>
                </Stack>
                <Stack gap={4}>
                  <Group gap="xs">
                    <IconCalendar size={16} color="#3b82f6" />
                    <Text size="sm" fw={500}>Reportado</Text>
                  </Group>
                  <Text size="sm" c="dimmed" pl={24}>
                    {formatFecha(selectedReporte.fecha_creacion)}
                  </Text>
                </Stack>
              </Group>

              <Divider />

              {/* Acciones */}
              <Group justify="space-between">
                <Group gap="md">
                  <Button
                    variant="light"
                    leftSection={<IconThumbUp size={18} />}
                    onClick={() => handleVotar(selectedReporte.id)}
                  >
                    Apoyar ({selectedReporte.votos_apoyo})
                  </Button>
                  <Text size="sm" c="dimmed">
                    <IconEye size={16} style={{ verticalAlign: 'middle' }} /> {selectedReporte.vistas || 0} vistas
                  </Text>
                </Group>

                <Button
                  leftSection={<IconMapPin size={18} />}
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${selectedReporte.latitud},${selectedReporte.longitud}`,
                      '_blank'
                    )
                  }}
                >
                  Ver en Google Maps
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(MapaPublicoPage, { allowedRoles: ['ciudadano'] })