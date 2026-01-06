// ============================================================================
// WILLAY MAP - Página de Notificaciones
// ============================================================================

import { useState } from 'react'
import Head from 'next/head'
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Box,
  Badge,
  ActionIcon,
  ThemeIcon,
  Tabs,
  Card,
  Tooltip,
  Menu,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconDotsVertical,
  IconFileDescription,
  IconAlertCircle,
  IconCalendarEvent,
  IconChevronRight,
  IconInbox,
} from '@tabler/icons-react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'

const MotionCard = motion(Card)

const TIPO_ICONOS = {
  reporte_resuelto: { icon: IconCheck, color: 'green' },
  reporte_en_proceso: { icon: IconAlertCircle, color: 'orange' },
  evento_proximo: { icon: IconCalendarEvent, color: 'pink' },
  sistema: { icon: IconBell, color: 'gray' },
}

const notificacionesEjemplo = [
  {
    id: '1',
    tipo: 'reporte_resuelto',
    titulo: '¡Problema resuelto!',
    mensaje: 'Tu reporte RPT-20250106-0004 ha sido resuelto.',
    enlace: '/ciudadano/reportes',
    leida: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    tipo: 'reporte_en_proceso',
    titulo: 'Reporte en proceso',
    mensaje: 'Ya se está trabajando en tu reporte RPT-20250106-0001.',
    enlace: '/ciudadano/reportes',
    leida: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    tipo: 'evento_proximo',
    titulo: 'Evento mañana',
    mensaje: 'Campaña de Vacunación Canina en Plaza de Armas.',
    enlace: '/ciudadano/agenda',
    leida: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

function NotificacionesPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [notificaciones, setNotificaciones] = useState(notificacionesEjemplo)
  const [tabActiva, setTabActiva] = useState('todas')

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const notificacionesFiltradas = notificaciones.filter((n) => {
    if (tabActiva === 'no_leidas') return !n.leida
    if (tabActiva === 'leidas') return n.leida
    return true
  })

  const marcarComoLeida = (id) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  const eliminar = (id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))
  }

  const formatTiempo = (fecha) => {
    const diffMs = new Date() - new Date(fecha)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHoras < 24) return `Hace ${diffHoras}h`
    return `Hace ${Math.floor(diffMs / 86400000)} días`
  }

  return (
    <>
      <Head>
        <title>Notificaciones | Willay Map</title>
      </Head>

      <DashboardLayout user={profile} title="Notificaciones">
        <Container size="md" py="md">
          <Paper
            p="xl"
            mb="xl"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
            }}
          >
            <Group justify="space-between">
              <Group gap="md">
                <ThemeIcon size={50} radius="xl" color="white" variant="white">
                  <IconBell size={28} color="#3b82f6" />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Notificaciones</Title>
                  <Text opacity={0.9}>
                    {noLeidas > 0 ? `${noLeidas} sin leer` : 'Estás al día'}
                  </Text>
                </Box>
              </Group>
            </Group>
          </Paper>

          <Tabs value={tabActiva} onChange={setTabActiva} mb="lg">
            <Tabs.List>
              <Tabs.Tab value="todas">Todas ({notificaciones.length})</Tabs.Tab>
              <Tabs.Tab value="no_leidas">No leídas ({noLeidas})</Tabs.Tab>
              <Tabs.Tab value="leidas">Leídas</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <AnimatePresence>
            {notificacionesFiltradas.length === 0 ? (
              <Paper p="xl" radius="lg" ta="center" withBorder>
                <IconInbox size={48} color="#94a3b8" />
                <Text size="lg" c="dimmed" mt="md">No hay notificaciones</Text>
              </Paper>
            ) : (
              <Stack gap="sm">
                {notificacionesFiltradas.map((notif, index) => {
                  const config = TIPO_ICONOS[notif.tipo] || TIPO_ICONOS.sistema
                  const IconComp = config.icon
                  return (
                    <MotionCard
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      padding="md"
                      radius="lg"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        background: notif.leida ? 'white' : '#f0f9ff',
                        borderLeft: notif.leida ? undefined : '4px solid #3b82f6',
                      }}
                      onClick={() => {
                        marcarComoLeida(notif.id)
                        if (notif.enlace) router.push(notif.enlace)
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="md" wrap="nowrap" style={{ flex: 1 }}>
                          <ThemeIcon size={44} radius="md" variant="light" color={config.color}>
                            <IconComp size={22} />
                          </ThemeIcon>
                          <Box style={{ flex: 1 }}>
                            <Group gap="xs" mb={4}>
                              <Text fw={600} size="sm">{notif.titulo}</Text>
                              {!notif.leida && <Badge size="xs" color="blue">Nueva</Badge>}
                            </Group>
                            <Text size="sm" c="dimmed" lineClamp={1}>{notif.mensaje}</Text>
                            <Text size="xs" c="dimmed">{formatTiempo(notif.created_at)}</Text>
                          </Box>
                        </Group>
                        <Group gap="xs">
                          {!notif.leida && (
                            <Tooltip label="Marcar leída">
                              <ActionIcon variant="light" color="blue" onClick={(e) => { e.stopPropagation(); marcarComoLeida(notif.id) }}>
                                <IconCheck size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="Eliminar">
                            <ActionIcon variant="light" color="red" onClick={(e) => { e.stopPropagation(); eliminar(notif.id) }}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </MotionCard>
                  )
                })}
              </Stack>
            )}
          </AnimatePresence>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(NotificacionesPage, { allowedRoles: ['ciudadano'] })