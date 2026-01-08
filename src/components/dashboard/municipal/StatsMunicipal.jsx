// ============================================
// STATS MUNICIPAL - Estadísticas del municipio
// Archivo: src/components/dashboard/municipal/StatsMunicipal.jsx
// ============================================

import { useState, useEffect } from 'react'
import { SimpleGrid, Paper, Text, Group, Box, ThemeIcon, Skeleton, RingProgress, Center } from '@mantine/core'
import {
  IconFileDescription,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconX,
  IconTrendingUp,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const statsConfig = [
  { 
    key: 'total', 
    label: 'Total Reportes', 
    icon: IconFileDescription, 
    color: '#3b82f6', 
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    bgGlow: 'rgba(59, 130, 246, 0.1)' 
  },
  { 
    key: 'nuevos', 
    label: 'Nuevos', 
    icon: IconAlertCircle, 
    color: '#f59e0b', 
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    bgGlow: 'rgba(245, 158, 11, 0.1)' 
  },
  { 
    key: 'en_proceso', 
    label: 'En Proceso', 
    icon: IconClock, 
    color: '#8b5cf6', 
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    bgGlow: 'rgba(139, 92, 246, 0.1)' 
  },
  { 
    key: 'resueltos', 
    label: 'Resueltos', 
    icon: IconCheck, 
    color: '#10b981', 
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgGlow: 'rgba(16, 185, 129, 0.1)' 
  },
  { 
    key: 'rechazados', 
    label: 'Rechazados', 
    icon: IconX, 
    color: '#ef4444', 
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bgGlow: 'rgba(239, 68, 68, 0.1)' 
  },
]

export default function StatsMunicipal() {
  const [stats, setStats] = useState({
    total: 0,
    nuevos: 0,
    en_proceso: 0,
    resueltos: 0,
    rechazados: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarStats = async () => {
      try {
        // Query simplificado - solo traer estado
        const { data, error } = await supabase
          .from('reportes')
          .select('estado')

        if (error) throw error

        const reportes = data || []
        setStats({
          total: reportes.length,
          nuevos: reportes.filter(r => r.estado === 'nuevo').length,
          en_proceso: reportes.filter(r => ['en_revision', 'asignado', 'en_proceso'].includes(r.estado)).length,
          resueltos: reportes.filter(r => r.estado === 'resuelto').length,
          rechazados: reportes.filter(r => r.estado === 'rechazado').length,
        })
      } catch (error) {
        console.error('Error cargando stats:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarStats()

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('stats-municipal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => {
        cargarStats()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={120} radius="xl" />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Box>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="md">
        {statsConfig.map((stat, index) => {
          const IconComponent = stat.icon
          const value = stats[stat.key]

          return (
            <Paper
              key={stat.key}
              radius="xl"
              p="lg"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 20px 40px ${stat.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {/* Decoración de fondo */}
              <Box
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: stat.bgGlow,
                }}
              />

              <Group justify="space-between" mb="xs" style={{ position: 'relative' }}>
                <ThemeIcon
                  size={48}
                  radius="xl"
                  style={{
                    background: stat.gradient,
                    boxShadow: `0 8px 20px ${stat.color}40`,
                  }}
                >
                  <IconComponent size={24} color="white" stroke={1.5} />
                </ThemeIcon>
                {stat.key === 'nuevos' && value > 0 && (
                  <IconTrendingUp size={16} color="#f59e0b" />
                )}
              </Group>

              <Text
                fw={800}
                size="1.8rem"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  lineHeight: 1.2,
                  color: stat.color,
                }}
              >
                {value}
              </Text>
              <Text size="sm" c="dimmed" fw={500}>
                {stat.label}
              </Text>
            </Paper>
          )
        })}
      </SimpleGrid>

      {/* Gráfico de distribución */}
      {stats.total > 0 && (
        <Paper radius="xl" p="lg" mt="lg" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text fw={600} size="lg" mb="xs">Distribución de Reportes</Text>
              <Text size="sm" c="dimmed">Estado actual de todos los reportes</Text>
            </Box>
            <Center>
              <RingProgress
                size={140}
                thickness={16}
                roundCaps
                sections={[
                  { value: (stats.nuevos / stats.total) * 100, color: '#f59e0b' },
                  { value: (stats.en_proceso / stats.total) * 100, color: '#8b5cf6' },
                  { value: (stats.resueltos / stats.total) * 100, color: '#10b981' },
                  { value: (stats.rechazados / stats.total) * 100, color: '#ef4444' },
                ]}
                label={
                  <Center>
                    <Box ta="center">
                      <Text fw={800} size="xl" style={{ fontFamily: 'Space Grotesk' }}>
                        {stats.total}
                      </Text>
                      <Text size="xs" c="dimmed">Total</Text>
                    </Box>
                  </Center>
                }
              />
            </Center>
          </Group>

          <Group justify="center" mt="md" gap="xl">
            {[
              { label: 'Nuevos', color: '#f59e0b', value: stats.nuevos },
              { label: 'En Proceso', color: '#8b5cf6', value: stats.en_proceso },
              { label: 'Resueltos', color: '#10b981', value: stats.resueltos },
              { label: 'Rechazados', color: '#ef4444', value: stats.rechazados },
            ].map((item) => (
              <Group key={item.label} gap={6}>
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: item.color,
                  }}
                />
                <Text size="sm" c="dimmed">
                  {item.label}: <strong>{item.value}</strong>
                </Text>
              </Group>
            ))}
          </Group>
        </Paper>
      )}
    </Box>
  )
}
