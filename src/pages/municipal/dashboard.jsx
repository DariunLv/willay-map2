// ============================================
// DASHBOARD MUNICIPAL - Página principal
// Archivo: src/pages/municipal/dashboard.jsx
// ============================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import {
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Group,
  Box,
  Badge,
  Loader,
  Center,
  ThemeIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconBuildingCommunity,
  IconMapPin,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Componentes cargados dinámicamente
const StatsMunicipal = dynamic(
  () => import('@/components/dashboard/municipal/StatsMunicipal'),
  { ssr: false, loading: () => <Center py="xl"><Loader /></Center> }
)

const MapaMunicipal = dynamic(
  () => import('@/components/dashboard/municipal/MapaMunicipal'),
  { ssr: false, loading: () => <Center h={400}><Loader /></Center> }
)

const ListaReportesMunicipal = dynamic(
  () => import('@/components/dashboard/municipal/ListaReportesMunicipal'),
  { ssr: false, loading: () => <Center py="xl"><Loader /></Center> }
)

const ModalDetalleReporte = dynamic(
  () => import('@/components/dashboard/municipal/ModalDetalleReporte'),
  { ssr: false }
)

function MunicipalDashboard() {
  const { user, profile } = useAuth()
  const [reportes, setReportes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReporte, setSelectedReporte] = useState(null)

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')

        if (error) throw error
        setCategorias(data || [])
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    }
    cargarCategorias()
  }, [])

  // Cargar reportes
  const cargarReportes = async () => {
    setLoading(true)
    try {
      // Query simplificado - primero obtenemos reportes
      let query = supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtroEstado) {
        query = query.eq('estado', filtroEstado)
      }
      if (filtroPrioridad) {
        query = query.eq('prioridad', filtroPrioridad)
      }
      if (filtroCategoria) {
        query = query.eq('categoria_id', filtroCategoria)
      }

      const { data: reportesData, error: reportesError } = await query.limit(200)

      if (reportesError) throw reportesError

      // Obtener categorías
      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')

      // Obtener usuarios
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*')

      // Combinar datos
      const reportesCompletos = (reportesData || []).map(reporte => {
        const categoria = categoriasData?.find(c => c.id === reporte.categoria_id)
        const usuario = usuariosData?.find(u => u.id === reporte.usuario_id)
        return {
          ...reporte,
          categoria: categoria || null,
          usuario: usuario || null,
        }
      })

      setReportes(reportesCompletos)

    } catch (error) {
      console.error('Error cargando reportes:', error)
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los reportes: ' + error.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [filtroEstado, filtroPrioridad, filtroCategoria])

  // Suscripción en tiempo real
  useEffect(() => {
    const subscription = supabase
      .channel('reportes-municipal-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reportes' },
        () => cargarReportes()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const verDetalle = (reporte) => {
    setSelectedReporte(reporte)
    setModalOpen(true)
  }

  const handleReporteActualizado = () => {
    cargarReportes()
  }

  const getFechaHoy = () => {
    return new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <>
      <Head>
        <title>Panel Municipal | Willay Map</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </Head>

      <DashboardLayout user={profile} title="Panel Municipal">
        <Container size="xl" py="md">
          {/* Header */}
          <Paper
            p="xl"
            mb="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />

            <Group justify="space-between" align="flex-start" style={{ position: 'relative' }}>
              <Group gap="md">
                <ThemeIcon
                  size={60}
                  radius="xl"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <IconBuildingCommunity size={32} color="white" />
                </ThemeIcon>
                <Box>
                  <Title order={2} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Panel Municipal
                  </Title>
                  <Text opacity={0.9} size="sm">
                    Gestión y seguimiento de reportes ciudadanos
                  </Text>
                </Box>
              </Group>

              <Box ta="right">
                <Badge size="xl" variant="white" color="dark">
                  {reportes.length} reportes
                </Badge>
                <Text size="xs" mt="xs" opacity={0.8}>
                  {getFechaHoy()}
                </Text>
              </Box>
            </Group>

            <Text size="sm" mt="md" opacity={0.9}>
              Bienvenido, <strong>{profile?.full_name || 'Administrador'}</strong>
            </Text>
          </Paper>

          {/* Estadísticas */}
          <Box mb="xl">
            <StatsMunicipal />
          </Box>

          {/* Contenido principal */}
          <Grid gutter="lg">
            {/* Mapa */}
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Paper
                radius="xl"
                p="md"
                style={{
                  border: '1px solid #e2e8f0',
                  height: 550,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Group justify="space-between" mb="md">
                  <Group gap="sm">
                    <ThemeIcon size={36} radius="xl" color="green" variant="light">
                      <IconMapPin size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700}>Mapa de Reportes</Text>
                      <Text size="xs" c="dimmed">
                        Vista en tiempo real
                      </Text>
                    </Box>
                  </Group>
                  <Badge variant="dot" color="green" size="lg">
                    {reportes.filter(r => r.latitud && r.longitud).length} con ubicación
                  </Badge>
                </Group>

                <Box style={{ flex: 1, minHeight: 0 }}>
                  <MapaMunicipal
                    reportes={reportes}
                    onMarkerClick={verDetalle}
                    onRefresh={cargarReportes}
                    loading={loading}
                  />
                </Box>
              </Paper>
            </Grid.Col>

            {/* Lista de reportes */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <Box style={{ height: 550 }}>
                <ListaReportesMunicipal
                  reportes={reportes}
                  loading={loading}
                  onVerDetalle={verDetalle}
                  onRefresh={cargarReportes}
                  filtroEstado={filtroEstado}
                  setFiltroEstado={setFiltroEstado}
                  filtroPrioridad={filtroPrioridad}
                  setFiltroPrioridad={setFiltroPrioridad}
                  filtroCategoria={filtroCategoria}
                  setFiltroCategoria={setFiltroCategoria}
                  categorias={categorias}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>

        {/* Modal de detalle */}
        <ModalDetalleReporte
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          reporte={selectedReporte}
          onActualizado={handleReporteActualizado}
          userId={user?.id}
        />
      </DashboardLayout>
    </>
  )
}

export default withAuth(MunicipalDashboard, {
  allowedRoles: ['municipal', 'admin'],
})
