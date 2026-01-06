import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  AppShell,
  Navbar,
  Header,
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
  Stack,
  Paper
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin,
  IconPlus,
  IconClipboardList,
  IconBell,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconHome,
  IconCalendarEvent
} from '@tabler/icons-react'
import { getCurrentUser, logout } from '@/lib/supabase'

const stats = [
  { title: 'Mis Reportes', value: '5', icon: IconClipboardList, color: 'blue' },
  { title: 'En Proceso', value: '2', icon: IconClock, color: 'yellow' },
  { title: 'Resueltos', value: '3', icon: IconCheck, color: 'green' },
]

export default function CitizenDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error:', error)
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
        <title>Mi Dashboard - Willay Map</title>
      </Head>

      <Box style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <Box
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconMapPin size={22} color="white" />
              </Box>
              <Title order={4} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Willay<span style={{ color: '#3b82f6' }}>Map</span>
              </Title>
            </Group>

            <Group gap="md">
              <Button variant="light" leftSection={<IconBell size={18} />}>
                <Badge size="xs" color="red" variant="filled" style={{ marginLeft: 4 }}>3</Badge>
              </Button>
              
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="xs">
                      <Avatar color="blue" radius="xl">
                        {user?.profile?.full_name?.charAt(0) || 'U'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>{user?.profile?.full_name || 'Usuario'}</Text>
                        <Text c="dimmed" size="xs">Ciudadano</Text>
                      </div>
                      <IconChevronDown size={16} />
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
        <Box style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper
              p="xl"
              radius="lg"
              mb="xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between" wrap="wrap">
                <div>
                  <Title order={2} mb="xs">
                    ¡Hola, {user?.profile?.full_name?.split(' ')[0] || 'Ciudadano'}! 👋
                  </Title>
                  <Text opacity={0.9}>
                    Bienvenido a tu panel de control. Desde aquí puedes gestionar tus reportes.
                  </Text>
                </div>
                <Button
                  size="lg"
                  variant="white"
                  color="blue"
                  leftSection={<IconPlus size={20} />}
                >
                  Nuevo Reporte
                </Button>
              </Group>
            </Paper>
          </motion.div>

          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="lg" radius="lg" withBorder>
                  <Group>
                    <ThemeIcon size={50} radius="md" variant="light" color={stat.color}>
                      <stat.icon size={26} />
                    </ThemeIcon>
                    <div>
                      <Text size="2rem" fw={700} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {stat.value}
                      </Text>
                      <Text size="sm" c="dimmed">{stat.title}</Text>
                    </div>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <Title order={4} mb="md">Acciones Rápidas</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {[
              { icon: IconPlus, label: 'Nuevo Reporte', color: 'blue', desc: 'Reportar un problema' },
              { icon: IconClipboardList, label: 'Mis Reportes', color: 'violet', desc: 'Ver historial' },
              { icon: IconCalendarEvent, label: 'Eventos', color: 'green', desc: 'Agenda vecinal' },
              { icon: IconHome, label: 'Mapa', color: 'orange', desc: 'Ver mapa público' },
            ].map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  padding="lg"
                  radius="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                >
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={48} radius="xl" variant="light" color={action.color}>
                      <action.icon size={24} />
                    </ThemeIcon>
                    <Text fw={600}>{action.label}</Text>
                    <Text size="xs" c="dimmed" ta="center">{action.desc}</Text>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </>
  )
}