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
  SimpleGrid,
  Avatar,
  Menu,
  UnstyledButton,
  Badge,
  ThemeIcon,
  Paper,
  RingProgress,
  Center
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin,
  IconClipboardList,
  IconBell,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconUsers,
  IconTruck,
  IconChartBar,
  IconMap
} from '@tabler/icons-react'
import { getCurrentUser, logout } from '@/lib/supabase'

const stats = [
  { title: 'Total Reportes', value: '156', icon: IconClipboardList, color: 'blue' },
  { title: 'Pendientes', value: '23', icon: IconClock, color: 'yellow' },
  { title: 'En Proceso', value: '18', icon: IconAlertTriangle, color: 'orange' },
  { title: 'Resueltos Hoy', value: '12', icon: IconCheck, color: 'green' },
]

export default function MunicipioDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || !['admin', 'operador'].includes(currentUser.profile?.role)) {
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
        <title>Panel Municipal - Willay Map</title>
      </Head>

      <Box style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <Box
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
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
                <Text size="xs" c="white" opacity={0.8}>Panel Municipal</Text>
              </div>
            </Group>

            <Group gap="md">
              <Button variant="light" color="white" leftSection={<IconBell size={18} />}>
                <Badge size="xs" color="red" variant="filled">5</Badge>
              </Button>
              
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="xs">
                      <Avatar color="white" radius="xl">
                        {user?.profile?.full_name?.charAt(0) || 'O'}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500} c="white">{user?.profile?.full_name || 'Operador'}</Text>
                        <Text size="xs" c="white" opacity={0.7}>
                          {user?.profile?.role === 'admin' ? 'Administrador' : 'Operador'}
                        </Text>
                      </div>
                      <IconChevronDown size={16} color="white" />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconUser size={14} />}>Mi Perfil</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                    Cerrar Sesión
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Box>

        {/* Content */}
        <Box style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="lg" radius="lg" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{stat.title}</Text>
                      <Text size="2rem" fw={700} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {stat.value}
                      </Text>
                    </div>
                    <ThemeIcon size={50} radius="md" variant="light" color={stat.color}>
                      <stat.icon size={26} />
                    </ThemeIcon>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Main Content */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            {/* Reportes por estado */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card padding="lg" radius="lg" withBorder>
                <Title order={5} mb="lg">Estado de Reportes</Title>
                <Center>
                  <RingProgress
                    size={200}
                    thickness={20}
                    roundCaps
                    sections={[
                      { value: 40, color: 'green', tooltip: 'Resueltos - 40%' },
                      { value: 25, color: 'yellow', tooltip: 'En proceso - 25%' },
                      { value: 20, color: 'orange', tooltip: 'Asignados - 20%' },
                      { value: 15, color: 'red', tooltip: 'Pendientes - 15%' },
                    ]}
                    label={
                      <Center>
                        <div style={{ textAlign: 'center' }}>
                          <Text size="xl" fw={700}>156</Text>
                          <Text size="xs" c="dimmed">Total</Text>
                        </div>
                      </Center>
                    }
                  />
                </Center>
              </Card>
            </motion.div>

            {/* Acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card padding="lg" radius="lg" withBorder>
                <Title order={5} mb="lg">Acciones Rápidas</Title>
                <SimpleGrid cols={2} spacing="md">
                  {[
                    { icon: IconMap, label: 'Mapa Táctico', color: 'blue' },
                    { icon: IconClipboardList, label: 'Gestionar Reportes', color: 'violet' },
                    { icon: IconTruck, label: 'Cuadrillas', color: 'green' },
                    { icon: IconChartBar, label: 'Estadísticas', color: 'orange' },
                    { icon: IconUsers, label: 'Usuarios', color: 'cyan' },
                    { icon: IconBell, label: 'Notificaciones', color: 'pink' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="light"
                      color={action.color}
                      leftSection={<action.icon size={18} />}
                      fullWidth
                      style={{ height: 50 }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Card>
            </motion.div>
          </SimpleGrid>
        </Box>
      </Box>
    </>
  )
}