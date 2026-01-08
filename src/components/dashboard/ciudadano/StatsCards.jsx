import { useState, useEffect } from 'react'
import { SimpleGrid, Paper, Text, Group, ThemeIcon, Skeleton } from '@mantine/core'
import {
  IconFileDescription,
  IconClock,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

export default function StatsCards({ userId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Obtener reportes del usuario desde Supabase
        const { data: reportes, error } = await supabase
          .from('reportes')
          .select('estado')
          .eq('usuario_id', userId)

        if (error) throw error

        // Calcular estadísticas reales
        const total = reportes?.length || 0
        const enProceso = reportes?.filter(r => 
          ['nuevo', 'en_revision', 'asignado', 'en_proceso'].includes(r.estado)
        ).length || 0
        const resueltos = reportes?.filter(r => r.estado === 'resuelto').length || 0
        const rechazados = reportes?.filter(r => r.estado === 'rechazado').length || 0

        setStats({
          total,
          enProceso,
          resueltos,
          rechazados,
        })
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
        setStats({ total: 0, enProceso: 0, resueltos: 0, rechazados: 0 })
      } finally {
        setLoading(false)
      }
    }

    cargarEstadisticas()
  }, [userId])

  const statItems = [
    {
      title: 'Total Reportes',
      value: stats?.total || 0,
      icon: IconFileDescription,
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
    {
      title: 'En Proceso',
      value: stats?.enProceso || 0,
      icon: IconClock,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    {
      title: 'Resueltos',
      value: stats?.resueltos || 0,
      icon: IconCheck,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Rechazados',
      value: stats?.rechazados || 0,
      icon: IconAlertCircle,
      color: '#ef4444',
      bgColor: '#fef2f2',
    },
  ]

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
      {statItems.map((stat) => (
        <Paper
          key={stat.title}
          p="md"
          radius="lg"
          withBorder
          style={{
            borderColor: `${stat.color}30`,
            background: stat.bgColor,
          }}
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {stat.title}
              </Text>
              <Text size="xl" fw={700} style={{ color: stat.color }}>
                {stat.value}
              </Text>
            </div>
            <ThemeIcon
              size={40}
              radius="md"
              style={{ background: `${stat.color}20` }}
            >
              <stat.icon size={22} color={stat.color} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  )
}