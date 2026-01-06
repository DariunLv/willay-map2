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
  Progress
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconServer,
  IconDatabase,
  IconCloud,
  IconShield,
  IconUsers,
  IconSettings,
  IconActivity,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react'
import { getCurrentUser, logout } from '@/lib/supabase'

const systemStatus = [
  { name: 'API Backend', status: 'online', icon: IconServer },
  { name: 'Base de Datos', status: 'online', icon: IconDatabase },
  { name: 'Almacenamiento', status: 'online', icon: IconCloud },
  { name: 'Autenticación', status: 'online', icon: IconShield },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.profile?.role !== 'admin') {
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
        <title>Admin Panel - Willay Map</title>
      </Head>

      <Box style={{ minHeight: '100vh', background: '#0f172a' }}>
        {/* Header */}
        <Box
          style={{
            background: '#1e293b',
            padding: '16px 24px',
            borderBottom: '1px solid #334155',
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
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconShield size={22} color="white" />
              </Box>
              <div>
                <Title order={4} style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'white' }}>
                  WillayMap
                </Title>
                <Text size="xs" c="red">Super Admin</Text>
              </div>
            </Group>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="red" radius="xl">
                      {user?.profile?.full_name?.charAt(0) || 'A'}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} c="white">{user?.profile?.full_name || 'Admin'}</Text>
                      <Text size="xs" c="red">Administrador</Text>
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
        </Box>

        {/* Content */}
        <Box style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
          {/* System Health */}
          <Title order={4} c="white" mb="md">Estado del Sistema</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
            {systemStatus.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="lg" radius="lg" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                  <Group justify="space-between">
                    <Group gap="md">
                      <ThemeIcon size={40} radius="md" variant="light" color="gray">
                        <service.icon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" c="white">{service.name}</Text>
                        <Badge color="green" variant="light" size="sm">
                          <Group gap={4}>
                            <IconCheck size={12} />
                            Online
                          </Group>
                        </Badge>
                      </div>
                    </Group>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Stats */}
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" mb="xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card padding="lg" radius="lg" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                <Title order={5} c="white" mb="lg">Uso de Recursos</Title>
                <Stack gap="md">
                  {[
                    { name: 'CPU', value: 45 },
                    { name: 'Memoria', value: 62 },
                    { name: 'Almacenamiento', value: 28 },
                    { name: 'Ancho de banda', value: 15 },
                  ].map((resource) => (
                    <div key={resource.name}>
                      <Group justify="space-between" mb={4}>
                        <Text size="sm" c="gray">{resource.name}</Text>
                        <Text size="sm" c="white">{resource.value}%</Text>
                      </Group>
                      <Progress
                        value={resource.value}
                        color={resource.value > 80 ? 'red' : resource.value > 60 ? 'yellow' : 'green'}
                        size="sm"
                        radius="xl"
                      />
                    </div>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card padding="lg" radius="lg" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                <Title order={5} c="white" mb="lg">Acciones de Administrador</Title>
                <SimpleGrid cols={2} spacing="md">
                  {[
                    { icon: IconUsers, label: 'Gestionar Usuarios', color: 'blue' },
                    { icon: IconSettings, label: 'Configuración', color: 'violet' },
                    { icon: IconDatabase, label: 'Backups', color: 'green' },
                    { icon: IconActivity, label: 'Logs del Sistema', color: 'orange' },
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