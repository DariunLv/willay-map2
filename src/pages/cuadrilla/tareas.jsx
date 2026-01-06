import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Title,
  Text,
  Button,
  Group,
  Box,
  Card,
  Stack,
  Avatar,
  Menu,
  UnstyledButton,
  Badge,
  ThemeIcon,
  Switch,
  Paper
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin,
  IconLogout,
  IconChevronDown,
  IconChevronRight,
  IconNavigation,
  IconCamera,
  IconCheck,
  IconAlertTriangle,
  IconClock
} from '@tabler/icons-react'
import { getCurrentUser, logout } from '@/lib/supabase'

// Tareas de ejemplo
const tareas = [
  {
    id: 1,
    codigo: 'RPT-2025-00045',
    tipo: 'Bache',
    direccion: 'Av. Circunvalación 450',
    prioridad: 'alta',
    distancia: '1.2 km',
    emoji: '🕳️'
  },
  {
    id: 2,
    codigo: 'RPT-2025-00048',
    tipo: 'Alumbrado',
    direccion: 'Jr. Lampa 230',
    prioridad: 'media',
    distancia: '2.5 km',
    emoji: '💡'
  },
  {
    id: 3,
    codigo: 'RPT-2025-00051',
    tipo: 'Basura',
    direccion: 'Parque San Martín',
    prioridad: 'baja',
    distancia: '3.1 km',
    emoji: '🗑️'
  },
]

const getPriorityColor = (prioridad) => {
  switch (prioridad) {
    case 'critica': return 'red'
    case 'alta': return 'orange'
    case 'media': return 'yellow'
    default: return 'green'
  }
}

export default function CuadrillaDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enTurno, setEnTurno] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || !['admin', 'cuadrilla'].includes(currentUser.profile?.role)) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Cargando...</Text>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>Mis Tareas - Willay Map</title>
      </Head>

      <Box style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <Box
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Group justify="space-between">
            <Group gap="sm">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconMapPin size={22} color="white" />
              </Box>
              <div>
                <Title order={4} style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'white' }}>
                  WillayMap
                </Title>
                <Text size="xs" c="white" opacity={0.8}>Cuadrilla</Text>
              </div>
            </Group>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="white" radius="xl">
                      {user?.profile?.full_name?.charAt(0) || 'C'}
                    </Avatar>
                    <IconChevronDown size={16} color="white" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                  Cerrar Sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Box>

        {/* Content */}
        <Box style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
          {/* Estado de turno */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="lg" radius="lg" mb="lg" withBorder>
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="lg">Mi Turno</Text>
                  <Text size="sm" c="dimmed">
                    {enTurno ? 'GPS Activo - En servicio' : 'GPS Inactivo'}
                  </Text>
                </div>
                <Switch
                  size="xl"
                  checked={enTurno}
                  onChange={(e) => setEnTurno(e.currentTarget.checked)}
                  color="green"
                  onLabel="EN TURNO"
                  offLabel="DESCANSO"
                  styles={{
                    track: { width: 100 }
                  }}
                />
              </Group>
            </Card>
          </motion.div>

          {/* Lista de tareas */}
          <Title order={5} mb="md">
            Tareas Asignadas ({tareas.length})
          </Title>

          <Stack gap="md">
            {tareas.map((tarea, index) => (
              <motion.div
                key={tarea.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  padding="lg"
                  radius="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                      <Box
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 12,
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                        }}
                      >
                        {tarea.emoji}
                      </Box>
                      <div>
                        <Group gap="xs" mb={4}>
                          <Text fw={600}>{tarea.tipo}</Text>
                          <Badge size="sm" color={getPriorityColor(tarea.prioridad)}>
                            {tarea.prioridad}
                          </Badge>
                        </Group>
                        <Text size="sm" c="dimmed" lineClamp={1}>{tarea.direccion}</Text>
                        <Text size="xs" c="blue">{tarea.distancia}</Text>
                      </div>
                    </Group>
                    <IconChevronRight size={20} color="#94a3b8" />
                  </Group>

                  {/* Botón de acción principal */}
                  <Button
                    fullWidth
                    mt="md"
                    variant="gradient"
                    gradient={{ from: 'green', to: 'teal' }}
                    leftSection={<IconNavigation size={18} />}
                    disabled={!enTurno}
                  >
                    Ir al destino
                  </Button>
                </Card>
              </motion.div>
            ))}
          </Stack>

          {/* Botón de emergencia */}
          <Paper
            p="md"
            radius="lg"
            mt="xl"
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1px solid #fecaca',
            }}
          >
            <Button
              fullWidth
              color="red"
              variant="filled"
              size="lg"
              leftSection={<IconAlertTriangle size={20} />}
            >
              🆘 Botón SOS
            </Button>
            <Text size="xs" c="red" ta="center" mt="xs">
              Solo usar en caso de emergencia
            </Text>
          </Paper>
        </Box>
      </Box>
    </>
  )
}