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
  Loader,
  Center,
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
import { useAuth, withAuth } from '@/contexts/AuthContext'

// Cargar mapa dinámicamente
const DashboardMap = dynamic(
  () => import('@/components/dashboard/ciudadano/DashboardMap'),
  { ssr: false, loading: () => <Center h={400}><Loader /></Center> }
)

const MotionPaper = motion.create(Paper)

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

function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const saludo = getSaludo()
  const SaludoIcon = saludo.icon

  if (authLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    )
  }

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
                      {profile?.full_name?.split(' ')[0] || 'Ciudadano'}
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
          </MotionPaper>

          {/* Estadísticas reales */}
          <StatsCards userId={user?.id} />

          {/* Contenido principal */}
          <Grid mt="xl" gutter="lg">
            {/* Mapa con reportes reales */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Paper radius="lg" p="md" withBorder style={{ height: 450 }}>
                <Title order={4} mb="md">Mapa de Reportes</Title>
                <Box style={{ height: 380 }}>
                  <DashboardMap />
                </Box>
              </Paper>
            </Grid.Col>

            {/* Mis reportes recientes */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <MisReportes userId={user?.id} limit={5} />
            </Grid.Col>
          </Grid>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(DashboardPage, { allowedRoles: ['ciudadano'] })
