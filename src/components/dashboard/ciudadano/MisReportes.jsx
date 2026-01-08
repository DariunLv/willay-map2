import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Box,
  Skeleton,
  ThemeIcon,
  Image,
} from '@mantine/core'
import {
  IconPlus,
  IconChevronRight,
  IconMapPin,
  IconCalendar,
  IconInbox,
  IconRoadOff,
  IconBulbOff,
  IconTrash,
  IconDroplet,
  IconAlertTriangle,
  IconTree,
  IconBuilding,
  IconDots,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

// Mapeo de iconos por nombre
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

// Estados con colores
const ESTADOS = {
  nuevo: { label: 'Nuevo', color: 'blue' },
  en_revision: { label: 'En Revisión', color: 'yellow' },
  asignado: { label: 'Asignado', color: 'violet' },
  en_proceso: { label: 'En Proceso', color: 'orange' },
  resuelto: { label: 'Resuelto', color: 'green' },
  rechazado: { label: 'Rechazado', color: 'red' },
}

export default function MisReportes({ userId, limit = 5 }) {
  const router = useRouter()
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarReportes = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // Obtener reportes REALES del usuario desde Supabase
        const { data, error } = await supabase
          .from('reportes')
          .select(`
            *,
            categoria:categorias(id, nombre, icono, color)
          `)
          .eq('usuario_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

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
  }, [userId, limit])

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Paper radius="lg" p="md" withBorder style={{ height: '100%' }}>
        <Group justify="space-between" mb="md">
          <Skeleton height={24} width={150} />
          <Skeleton height={32} width={100} />
        </Group>
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} radius="md" />
          ))}
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper radius="lg" p="md" withBorder style={{ height: '100%' }}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Mis Reportes</Title>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => router.push('/ciudadano/nuevo-reporte')}
        >
          Nuevo
        </Button>
      </Group>

      {reportes.length === 0 ? (
        <Box ta="center" py="xl">
          <ThemeIcon size={60} radius="xl" color="gray" variant="light">
            <IconInbox size={30} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" mt="md">
            No tienes reportes aún
          </Text>
          <Button
            variant="light"
            size="sm"
            mt="md"
            onClick={() => router.push('/ciudadano/nuevo-reporte')}
          >
            Crear mi primer reporte
          </Button>
        </Box>
      ) : (
        <Stack gap="sm">
          {reportes.map((reporte) => {
            const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
            const IconCategoria = ICONOS[reporte.categoria?.icono] || IconDots

            return (
              <Paper
                key={reporte.id}
                p="sm"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: `4px solid ${reporte.categoria?.color || '#64748b'}`,
                }}
                onClick={() => router.push(`/ciudadano/reportes?id=${reporte.id}`)}
              >
                <Group gap="sm" wrap="nowrap">
                  {reporte.foto_url ? (
                    <Image
                      src={reporte.foto_url}
                      width={50}
                      height={50}
                      radius="md"
                      fit="cover"
                      fallbackSrc="https://placehold.co/50x50?text=..."
                    />
                  ) : (
                    <ThemeIcon
                      size={50}
                      radius="md"
                      style={{ background: reporte.categoria?.color || '#64748b' }}
                    >
                      <IconCategoria size={24} color="white" />
                    </ThemeIcon>
                  )}

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" fw={500}>
                        {reporte.codigo}
                      </Text>
                      <Badge size="xs" color={estado.color}>
                        {estado.label}
                      </Badge>
                    </Group>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {reporte.descripcion}
                    </Text>
                    <Group gap="xs" mt={4}>
                      <IconCalendar size={12} color="#94a3b8" />
                      <Text size="xs" c="dimmed">
                        {formatFecha(reporte.created_at)}
                      </Text>
                    </Group>
                  </Box>

                  <IconChevronRight size={18} color="#94a3b8" />
                </Group>
              </Paper>
            )
          })}

          {reportes.length >= limit && (
            <Button
              variant="subtle"
              fullWidth
              onClick={() => router.push('/ciudadano/reportes')}
            >
              Ver todos mis reportes
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  )
}