import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Box,
  Avatar,
  Menu,
  UnstyledButton,
  Divider,
  Tooltip,
  ActionIcon,
  Indicator,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconMapPin,
  IconHome,
  IconFileDescription,
  IconPlus,
  IconCalendarEvent,
  IconBell,
  IconSettings,
  IconLogout,
  IconUser,
  IconMap,
  IconChartBar,
  IconHeart,
} from '@tabler/icons-react'

const ciudadanoNavItems = [
  { icon: IconHome, label: 'Inicio', href: '/ciudadano/dashboard', color: '#3b82f6' },
  { icon: IconFileDescription, label: 'Mis Reportes', href: '/ciudadano/reportes', color: '#10b981' },
  { icon: IconCalendarEvent, label: 'Agenda Vecinal', href: '/ciudadano/agenda', color: '#f59e0b' },
  { icon: IconMap, label: 'Mapa Público', href: '/ciudadano/mapa', color: '#8b5cf6' },
]

const MotionBox = motion(Box)

export default function DashboardLayout({ children, user }) {
  const router = useRouter()
  const [opened, { toggle }] = useDisclosure()
  const [notifications] = useState(3)

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          minHeight: '100vh',
        },
      }}
    >
      {/* HEADER */}
      <AppShell.Header
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Group gap="xs">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
                  }}
                >
                  <IconMapPin size={24} color="white" />
                </Box>
                <Box>
                  <Text
                    fw={700}
                    size="lg"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}
                  >
                    Willay<span style={{ color: '#3b82f6' }}>Map</span>
                  </Text>
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                    Portal Ciudadano
                  </Text>
                </Box>
              </Group>
            </motion.div>
          </Group>

          <Group gap="sm">
            {/* Notificaciones */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip label="Notificaciones" position="bottom">
                <Indicator
                  inline
                  label={notifications}
                  size={18}
                  color="red"
                  disabled={notifications === 0}
                  styles={{ indicator: { fontWeight: 700, fontSize: 10 } }}
                >
                  <ActionIcon variant="light" size="lg" radius="xl" color="gray">
                    <IconBell size={20} />
                  </ActionIcon>
                </Indicator>
              </Tooltip>
            </motion.div>

            {/* Menu de usuario */}
            <Menu shadow="xl" width={240} position="bottom-end" radius="lg" offset={8}>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    borderRadius: 14,
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <Avatar
                    size={40}
                    radius="xl"
                    color="blue"
                    variant="gradient"
                    gradient={{ from: '#3b82f6', to: '#8b5cf6', deg: 135 }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={600} style={{ lineHeight: 1.2 }}>
                      {user?.name || 'Usuario'}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.2 }}>
                      Ciudadano
                    </Text>
                  </Box>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Box px="sm" py="xs" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <Text size="sm" fw={600}>{user?.name || 'Usuario'}</Text>
                  <Text size="xs" c="dimmed">{user?.email || 'email@example.com'}</Text>
                </Box>
                <Menu.Label>Mi Cuenta</Menu.Label>
                <Menu.Item leftSection={<IconUser size={16} />}>Mi Perfil</Menu.Item>
                <Menu.Item leftSection={<IconHeart size={16} />}>Mis Favoritos</Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />}>Configuración</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={handleLogout}>
                  Cerrar Sesión
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar
        p="md"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          borderRight: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <Box style={{ flex: 1 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" px="sm" style={{ letterSpacing: '0.05em' }}>
            Navegación
          </Text>
          
          {ciudadanoNavItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <NavLink
                href={item.href}
                label={item.label}
                leftSection={
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: router.pathname === item.href ? `${item.color}15` : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <item.icon 
                      size={20} 
                      color={router.pathname === item.href ? item.color : '#64748b'} 
                      stroke={router.pathname === item.href ? 2 : 1.5}
                    />
                  </Box>
                }
                rightSection={
                  router.pathname === item.href && (
                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                  )
                }
                active={router.pathname === item.href}
                onClick={(e) => { e.preventDefault(); router.push(item.href) }}
                styles={{
                  root: {
                    borderRadius: 14,
                    marginBottom: 6,
                    fontWeight: router.pathname === item.href ? 600 : 500,
                    color: router.pathname === item.href ? '#1e293b' : '#64748b',
                    background: router.pathname === item.href 
                      ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                      : 'transparent',
                    boxShadow: router.pathname === item.href ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                    border: router.pathname === item.href 
                      ? '1px solid rgba(226, 232, 240, 0.8)' 
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { background: '#f8fafc' },
                  },
                }}
              />
            </motion.div>
          ))}

          <Divider my="lg" color="#f1f5f9" />

          {/* Botón de nuevo reporte */}
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Box
              onClick={() => router.push('/ciudadano/nuevo-reporte')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: 16,
                padding: '18px 20px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.35)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shine 3s infinite',
                }}
              />
              <Group gap="sm">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconPlus size={24} color="white" />
                </Box>
                <Box>
                  <Text fw={700} size="sm" c="white">Nuevo Reporte</Text>
                  <Text size="xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Reportar un problema</Text>
                </Box>
              </Group>
            </Box>
          </motion.div>
        </Box>

        {/* Footer del sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Box
            style={{
              padding: 18,
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: 14,
              marginTop: 'auto',
              border: '1px solid rgba(59, 130, 246, 0.1)',
            }}
          >
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
                <IconChartBar size={20} color="white" />
              </Box>
              <Box>
                <Text size="xs" fw={700} c="dark">Tu Impacto</Text>
                <Text size="xs" c="dimmed">3 reportes activos</Text>
              </Box>
            </Group>
          </Box>
        </motion.div>
      </AppShell.Navbar>

      {/* CONTENIDO PRINCIPAL */}
      <AppShell.Main>
        <AnimatePresence mode="wait">
          <MotionBox
            key={router.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </MotionBox>
        </AnimatePresence>
      </AppShell.Main>

      <style jsx global>{`
        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </AppShell>
  )
}