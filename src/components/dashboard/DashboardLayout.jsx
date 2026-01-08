// ============================================
// DASHBOARD LAYOUT - CORREGIDO v2
// Archivo: src/components/dashboard/DashboardLayout.jsx
// ============================================

import { useState, useEffect } from 'react'
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
  Badge,
  Loader,
  Center,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconMapPin,
  IconHome,
  IconFileDescription,
  IconPlus,
  IconBell,
  IconSettings,
  IconLogout,
  IconUser,
  IconMap,
  IconChartBar,
  IconBuildingCommunity,
  IconUsers,
  IconTruck,
  IconSpeakerphone,
} from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Navegación para CIUDADANOS
const ciudadanoNavItems = [
  { icon: IconHome, label: 'Inicio', href: '/ciudadano/dashboard', color: '#3b82f6' },
  { icon: IconPlus, label: 'Nuevo Reporte', href: '/ciudadano/nuevo-reporte', color: '#10b981' },
  { icon: IconFileDescription, label: 'Mis Reportes', href: '/ciudadano/reportes', color: '#f59e0b' },
  { icon: IconMap, label: 'Mapa Público', href: '/ciudadano/mapa', color: '#8b5cf6' },
  { icon: IconSpeakerphone, label: 'Comunicados', href: '/ciudadano/comunicados', color: '#f59e0b' },
]

// Navegación para MUNICIPALES
const municipalNavItems = [
  { icon: IconHome, label: 'Dashboard', href: '/municipal/dashboard', color: '#059669' },
  { icon: IconFileDescription, label: 'Todos los Reportes', href: '/municipal/reportes', color: '#10b981' },
  { icon: IconMap, label: 'Mapa General', href: '/municipal/mapa', color: '#3b82f6' },
  { icon: IconTruck, label: 'Cuadrillas', href: '/municipal/cuadrillas', color: '#f59e0b' },
  { icon: IconChartBar, label: 'Estadísticas', href: '/municipal/estadisticas', color: '#8b5cf6' },
  { icon: IconSpeakerphone, label: 'Comunicados', href: '/municipal/comunicados', color: '#ec4899' },
  { icon: IconUsers, label: 'Usuarios', href: '/municipal/usuarios', color: '#64748b' },
]

export default function DashboardLayout({ children, user }) {
  const router = useRouter()
  const { logout, profile } = useAuth()
  const [opened, { toggle, close }] = useDisclosure()
  const [notificacionesCount, setNotificacionesCount] = useState(0)
  const [comunicadosCount, setComunicadosCount] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Esperar a que el router esté listo
  useEffect(() => {
    if (router.isReady) {
      setIsReady(true)
    }
  }, [router.isReady])

  // Obtener pathname de forma segura
  const pathname = router?.pathname || ''

  const rol = profile?.rol || user?.rol || 'ciudadano'
  const esMunicipal = rol === 'municipal' || rol === 'admin'
  
  const navItems = esMunicipal ? municipalNavItems : ciudadanoNavItems

  const primaryColor = esMunicipal ? '#059669' : '#3b82f6'
  const primaryGradient = esMunicipal 
    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'

  useEffect(() => {
    const cargarNotificaciones = async () => {
      if (!profile?.id) return
      try {
        const { count } = await supabase
          .from('notificaciones')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', profile.id)
          .eq('leida', false)

        setNotificacionesCount(count || 0)
      } catch (error) {}
    }

    if (profile?.id) {
      cargarNotificaciones()
    }
  }, [profile?.id])

  useEffect(() => {
    const cargarComunicadosCount = async () => {
      try {
        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)

        const { count } = await supabase
          .from('comunicados')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
          .gte('created_at', hace7Dias.toISOString())

        setComunicadosCount(count || 0)
      } catch (error) {}
    }

    if (!esMunicipal) {
      cargarComunicadosCount()
    }
  }, [esMunicipal])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      router.push('/login')
    }
  }

  const navigateTo = (href) => {
    close()
    router.push(href)
  }

  const userName = profile?.full_name || user?.full_name || user?.name || 'Usuario'
  const userEmail = profile?.email || user?.email || ''
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U'

  // Mostrar loader mientras el router no está listo
  if (!isReady) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    )
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
            <Group gap="xs">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: primaryGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 15px ${primaryColor}50`,
                }}
              >
                {esMunicipal ? (
                  <IconBuildingCommunity size={24} color="white" />
                ) : (
                  <IconMapPin size={24} color="white" />
                )}
              </Box>
              <Box>
                <Text fw={700} size="lg" style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
                  Willay<span style={{ color: primaryColor }}>Map</span>
                </Text>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                  {esMunicipal ? 'Panel Municipal' : 'Portal Ciudadano'}
                </Text>
              </Box>
            </Group>
          </Group>

          <Group gap="sm">
            <Tooltip label="Notificaciones" position="bottom">
              <Indicator
                inline
                label={notificacionesCount}
                size={18}
                color="red"
                disabled={notificacionesCount === 0}
              >
                <ActionIcon
                  variant="light"
                  size="lg"
                  radius="xl"
                  color="gray"
                  onClick={() => navigateTo('/notificaciones')}
                >
                  <IconBell size={20} />
                </ActionIcon>
              </Indicator>
            </Tooltip>

            <Menu shadow="xl" width={240} position="bottom-end" radius="lg" offset={8}>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    borderRadius: 14,
                  }}
                >
                  <Avatar size={40} radius="xl" color={esMunicipal ? 'green' : 'blue'}>
                    {userInitial}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={600}>{userName}</Text>
                    <Text size="xs" c="dimmed">{esMunicipal ? 'Municipal' : 'Ciudadano'}</Text>
                  </Box>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Box px="sm" py="xs" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <Text size="sm" fw={600}>{userName}</Text>
                  <Text size="xs" c="dimmed">{userEmail}</Text>
                </Box>
                <Menu.Label>Mi Cuenta</Menu.Label>
                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigateTo('/perfil')}>
                  Mi Perfil
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconBell size={16} />}
                  onClick={() => navigateTo('/notificaciones')}
                  rightSection={notificacionesCount > 0 && <Badge size="xs" color="red">{notificacionesCount}</Badge>}
                >
                  Notificaciones
                </Menu.Item>
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

      <AppShell.Navbar
        p="md"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
          borderRight: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <Box style={{ flex: 1 }}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" px="sm">
            {esMunicipal ? 'Gestión Municipal' : 'Navegación'}
          </Text>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const esComunicados = item.href.includes('comunicados')
            const ItemIcon = item.icon
            
            return (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: isActive ? `${item.color}15` : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ItemIcon size={20} color={isActive ? item.color : '#64748b'} stroke={isActive ? 2 : 1.5} />
                  </Box>
                }
                rightSection={
                  <Group gap={4}>
                    {isActive && <Box style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />}
                    {esComunicados && !esMunicipal && comunicadosCount > 0 && !isActive && (
                      <Badge size="xs" color="orange">{comunicadosCount}</Badge>
                    )}
                  </Group>
                }
                active={isActive}
                onClick={() => navigateTo(item.href)}
                styles={{
                  root: {
                    borderRadius: 14,
                    marginBottom: 6,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#1e293b' : '#64748b',
                    background: isActive ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' : 'transparent',
                    border: isActive ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid transparent',
                  },
                }}
              />
            )
          })}

          <Divider my="lg" color="#f1f5f9" />

          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm" px="sm">
            Accesos Rápidos
          </Text>

          <NavLink
            label="Mi Perfil"
            leftSection={
              <Box style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUser size={20} color="#64748b" />
              </Box>
            }
            active={pathname === '/perfil'}
            onClick={() => navigateTo('/perfil')}
            styles={{ root: { borderRadius: 14, marginBottom: 6 } }}
          />

          <NavLink
            label="Notificaciones"
            leftSection={
              <Box style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconBell size={20} color="#64748b" />
              </Box>
            }
            rightSection={notificacionesCount > 0 && <Badge size="sm" color="red">{notificacionesCount}</Badge>}
            active={pathname === '/notificaciones'}
            onClick={() => navigateTo('/notificaciones')}
            styles={{ root: { borderRadius: 14, marginBottom: 6 } }}
          />
        </Box>

        <Box
          style={{
            padding: 18,
            background: esMunicipal 
              ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: 14,
            marginTop: 'auto',
          }}
        >
          <Group gap="sm">
            <Avatar size={40} radius="xl" color={esMunicipal ? 'green' : 'blue'}>
              {userInitial}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} lineClamp={1}>{userName}</Text>
              <Text size="xs" c="dimmed" lineClamp={1}>{userEmail}</Text>
            </Box>
          </Group>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}