// ============================================================================
// WILLAY MAP - Dashboard Principal del Ciudadano
// ============================================================================

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
  ThemeIcon,
  Stack,
  Divider,
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin,
  IconSun,
  IconMoon,
  IconSunrise,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatsCards from '@/components/dashboard/ciudadano/StatsCards'
import MisReportes from '@/components/dashboard/ciudadano/MisReportes'
import AgendaVecinal from '@/components/dashboard/ciudadano/AgendaVecinal'
import AlertasPanel from '@/components/dashboard/ciudadano/AlertasPanel'
import TendenciasChart from '@/components/dashboard/ciudadano/TendenciasChart'
import FABNuevoReporte from '@/components/dashboard/ciudadano/FABNuevoReporte'
import { useAuth, withAuth } from '@/contexts/AuthContext'

// Importar mapa dinámicamente (sin SSR)
const DashboardMap = dynamic(
  () => import('@/components/dashboard/ciudadano/DashboardMap'),
  { ssr: false }
)

const MotionPaper = motion(Paper)

// Obtener saludo según hora del día
function getSaludo() {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) {
    return { texto: 'Buenos días', icon: IconSunrise, color: '#f59e0b' }
  } else if (hora >= 12 && hora < 19) {
    return { texto: 'Buenas tardes', icon: IconSun, color: '#f97316' }
  } else {
    return { texto: 'Buenas noches', icon: IconMoon, color: '#6366f1' }
  }
}

// Logros/noticias para el ticker
const logrosDelDia = [
  '🎉 ¡50 baches reparados esta semana en Puno!',
  '💡 Nuevo sistema de alumbrado LED en Av. El Sol',
  '🌳 Se plantaron 200 árboles en el Parque Pino',
  '✅ 95% de reportes resueltos en diciembre',
  '🚰 Nueva red de agua potable en Barrio Bellavista',
]

function DashboardPage() {
  const { profile } = useAuth()
  const [currentLogro, setCurrentLogro] = useState(0)
  const saludo = getSaludo()
  const SaludoIcon = saludo.icon

  // Rotar logros cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogro((prev) => (prev + 1) % logrosDelDia.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>Dashboard | Willay Map</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </Head>

      <DashboardLayout user={profile} title="Dashboard">
        <Container size="xl" py="md">
          {/* Header de bienvenida */}
          <MotionPaper
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            p="xl"
            mb="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decoración de fondo */}
            <Box
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box
              style={{
                position: 'absolute',
                bottom: -30,
                right: 100,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }}
            />

            <Group justify="space-between" align="flex-start">
              <Box>
                <Group gap="sm" mb="xs">
                  <ThemeIcon
                    size={44}
                    radius="xl"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <SaludoIcon size={24} color="white" />
                  </ThemeIcon>
                  <Box>
                    <Text size="sm" opacity={0.9}>
                      {saludo.texto}
                    </Text>
                    <Title order={2} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {profile?.nombre_completo?.split(' ')[0] || 'Ciudadano'}
                    </Title>
                  </Box>
                </Group>
                <Text size="sm" opacity={0.85} mt="md">
                  Tu participación hace la diferencia. Juntos construimos una mejor ciudad.
                </Text>
              </Box>

              <Box ta="right" visibleFrom="sm">
                <Badge
                  size="lg"
                  variant="white"
                  color="dark"
                  radius="md"
                  leftSection={<IconMapPin size={14} />}
                >
                  Puno, Perú
                </Badge>
                <Text size="xs" mt="xs" opacity={0.8}>
                  {new Date().toLocaleDateString('es-PE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Box>
            </Group>

            {/* Ticker de logros */}
            <Paper
              p="sm"
              mt="lg"
              radius="md"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <motion.div
                key={currentLogro}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Text size="sm" ta="center" fw={500}>
                  {logrosDelDia[currentLogro]}
                </Text>
              </motion.div>
            </Paper>
          </MotionPaper>

          {/* Estadísticas */}
          <StatsCards />

          {/* Contenido principal */}
          <Grid mt="xl" gutter="lg">
            {/* Mapa */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <DashboardMap />
            </Grid.Col>

            {/* Panel lateral */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <AlertasPanel />
            </Grid.Col>

            {/* Mis Reportes */}
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <MisReportes />
            </Grid.Col>

            {/* Tendencias */}
            <Grid.Col span={{ base: 12, lg: 5 }}>
              <TendenciasChart />
            </Grid.Col>

            {/* Agenda Vecinal */}
            <Grid.Col span={12}>
              <AgendaVecinal />
            </Grid.Col>
          </Grid>
        </Container>

        {/* Botón flotante */}
        <FABNuevoReporte />
      </DashboardLayout>
    </>
  )
}

export default withAuth(DashboardPage, { allowedRoles: ['ciudadano'] })