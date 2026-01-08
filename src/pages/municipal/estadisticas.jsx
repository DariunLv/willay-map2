// ============================================
// ESTADÍSTICAS MUNICIPAL
// Archivo: src/pages/municipal/estadisticas.jsx
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
  SimpleGrid,
  RingProgress,
  Center,
  Loader,
  Progress,
  Stack,
} from '@mantine/core'
import {
  IconChartBar,
  IconFileDescription,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconX,
  IconTrendingUp,
  IconUsers,
  IconCategory,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

function EstadisticasMunicipal() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    nuevos: 0,
    en_proceso: 0,
    resueltos: 0,
    rechazados: 0,
    porCategoria: [],
    porPrioridad: { baja: 0, media: 0, alta: 0, critica: 0 },
    tiempoPromedio: 0,
    totalUsuarios: 0,
  })

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        // Reportes
        const { data: reportes } = await supabase.from('reportes').select('*')
        const { data: categorias } = await supabase.from('categorias').select('*')
        const { data: usuarios } = await supabase.from('usuarios').select('id, rol')

        const total = reportes?.length || 0
        const nuevos = reportes?.filter(r => r.estado === 'nuevo').length || 0
        const en_proceso = reportes?.filter(r => ['en_revision', 'asignado', 'en_proceso'].includes(r.estado)).length || 0
        const resueltos = reportes?.filter(r => r.estado === 'resuelto').length || 0
        const rechazados = reportes?.filter(r => r.estado === 'rechazado').length || 0

        // Por categoría
        const porCategoria = categorias?.map(cat => ({
          nombre: cat.nombre,
          color: cat.color,
          cantidad: reportes?.filter(r => r.categoria_id === cat.id).length || 0,
        })).sort((a, b) => b.cantidad - a.cantidad) || []

        // Por prioridad
        const porPrioridad = {
          baja: reportes?.filter(r => r.prioridad === 'baja').length || 0,
          media: reportes?.filter(r => r.prioridad === 'media').length || 0,
          alta: reportes?.filter(r => r.prioridad === 'alta').length || 0,
          critica: reportes?.filter(r => r.prioridad === 'critica').length || 0,
        }

        // Tiempo promedio de resolución
        const resueltosList = reportes?.filter(r => r.estado === 'resuelto' && r.fecha_resolucion) || []
        let tiempoPromedio = 0
        if (resueltosList.length > 0) {
          const tiempos = resueltosList.map(r => {
            const inicio = new Date(r.created_at)
            const fin = new Date(r.fecha_resolucion)
            return (fin - inicio) / (1000 * 60 * 60 * 24) // días
          })
          tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        }

        setStats({
          total,
          nuevos,
          en_proceso,
          resueltos,
          rechazados,
          porCategoria,
          porPrioridad,
          tiempoPromedio: tiempoPromedio.toFixed(1),
          totalUsuarios: usuarios?.filter(u => u.rol === 'ciudadano').length || 0,
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [])

  if (loading) {
    return (
      <DashboardLayout user={profile}>
        <Center h="60vh"><Loader size="lg" /></Center>
      </DashboardLayout>
    )
  }

  const tasaResolucion = stats.total > 0 ? ((stats.resueltos / stats.total) * 100).toFixed(1) : 0

  return (
    <>
      <Head>
        <title>Estadísticas | Panel Municipal</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper p="lg" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
            <Group>
              <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <IconChartBar size={28} />
              </ThemeIcon>
              <Box>
                <Title order={2}>Estadísticas</Title>
                <Text opacity={0.9}>Análisis y métricas del sistema</Text>
              </Box>
            </Group>
          </Paper>

          {/* Cards principales */}
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} mb="lg">
            {[
              { label: 'Total Reportes', value: stats.total, icon: IconFileDescription, color: '#3b82f6' },
              { label: 'Nuevos', value: stats.nuevos, icon: IconAlertCircle, color: '#f59e0b' },
              { label: 'En Proceso', value: stats.en_proceso, icon: IconClock, color: '#8b5cf6' },
              { label: 'Resueltos', value: stats.resueltos, icon: IconCheck, color: '#10b981' },
              { label: 'Rechazados', value: stats.rechazados, icon: IconX, color: '#ef4444' },
            ].map((item) => (
              <Paper key={item.label} p="lg" radius="lg" withBorder>
                <Group justify="space-between" mb="xs">
                  <ThemeIcon size={40} radius="xl" style={{ background: item.color }}>
                    <item.icon size={20} color="white" />
                  </ThemeIcon>
                </Group>
                <Text size="2rem" fw={800} style={{ color: item.color }}>{item.value}</Text>
                <Text size="sm" c="dimmed">{item.label}</Text>
              </Paper>
            ))}
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} mb="lg">
            {/* Distribución por estado */}
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={700} mb="md">Distribución por Estado</Text>
              <Group justify="center">
                <RingProgress
                  size={180}
                  thickness={20}
                  roundCaps
                  sections={[
                    { value: (stats.nuevos / stats.total) * 100 || 0, color: '#f59e0b' },
                    { value: (stats.en_proceso / stats.total) * 100 || 0, color: '#8b5cf6' },
                    { value: (stats.resueltos / stats.total) * 100 || 0, color: '#10b981' },
                    { value: (stats.rechazados / stats.total) * 100 || 0, color: '#ef4444' },
                  ]}
                  label={
                    <Center>
                      <Box ta="center">
                        <Text size="xl" fw={800}>{tasaResolucion}%</Text>
                        <Text size="xs" c="dimmed">Resueltos</Text>
                      </Box>
                    </Center>
                  }
                />
              </Group>
              <SimpleGrid cols={2} mt="md">
                {[
                  { label: 'Nuevos', color: '#f59e0b', value: stats.nuevos },
                  { label: 'En Proceso', color: '#8b5cf6', value: stats.en_proceso },
                  { label: 'Resueltos', color: '#10b981', value: stats.resueltos },
                  { label: 'Rechazados', color: '#ef4444', value: stats.rechazados },
                ].map((item) => (
                  <Group key={item.label} gap="xs">
                    <Box style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                    <Text size="sm">{item.label}: <strong>{item.value}</strong></Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Paper>

            {/* Por prioridad */}
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={700} mb="md">Distribución por Prioridad</Text>
              <Stack gap="md">
                {[
                  { label: 'Crítica', value: stats.porPrioridad.critica, color: '#ef4444' },
                  { label: 'Alta', value: stats.porPrioridad.alta, color: '#f59e0b' },
                  { label: 'Media', value: stats.porPrioridad.media, color: '#3b82f6' },
                  { label: 'Baja', value: stats.porPrioridad.baja, color: '#10b981' },
                ].map((item) => (
                  <Box key={item.label}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm">{item.label}</Text>
                      <Text size="sm" fw={600}>{item.value}</Text>
                    </Group>
                    <Progress value={stats.total > 0 ? (item.value / stats.total) * 100 : 0} color={item.color} size="lg" radius="xl" />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* Por categoría */}
          <Paper p="lg" radius="lg" withBorder mb="lg">
            <Text fw={700} mb="md">Reportes por Categoría</Text>
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }}>
              {stats.porCategoria.map((cat) => (
                <Paper key={cat.nombre} p="md" radius="md" style={{ background: '#f8fafc' }}>
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Box style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
                      <Text size="sm" fw={500}>{cat.nombre}</Text>
                    </Group>
                    <Badge style={{ background: cat.color }}>{cat.cantidad}</Badge>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Métricas adicionales */}
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Paper p="lg" radius="lg" withBorder ta="center">
              <ThemeIcon size={50} radius="xl" color="blue" variant="light" mx="auto" mb="sm">
                <IconTrendingUp size={24} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="blue">{tasaResolucion}%</Text>
              <Text size="sm" c="dimmed">Tasa de Resolución</Text>
            </Paper>

            <Paper p="lg" radius="lg" withBorder ta="center">
              <ThemeIcon size={50} radius="xl" color="green" variant="light" mx="auto" mb="sm">
                <IconClock size={24} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="green">{stats.tiempoPromedio}</Text>
              <Text size="sm" c="dimmed">Días Prom. Resolución</Text>
            </Paper>

            <Paper p="lg" radius="lg" withBorder ta="center">
              <ThemeIcon size={50} radius="xl" color="violet" variant="light" mx="auto" mb="sm">
                <IconUsers size={24} />
              </ThemeIcon>
              <Text size="2rem" fw={800} c="violet">{stats.totalUsuarios}</Text>
              <Text size="sm" c="dimmed">Ciudadanos Registrados</Text>
            </Paper>
          </SimpleGrid>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(EstadisticasMunicipal, { allowedRoles: ['municipal', 'admin'] })
