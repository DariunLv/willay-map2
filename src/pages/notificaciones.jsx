// ============================================
// NOTIFICACIONES
// Archivo: src/pages/notificaciones.jsx
// ============================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Box,
  Badge,
  ThemeIcon,
  Stack,
  ActionIcon,
  Tooltip,
  Button,
  Center,
  Loader,
  Divider,
} from '@mantine/core'
import { notifications as notif } from '@mantine/notifications'
import {
  IconBell,
  IconCheck,
  IconTrash,
  IconFileDescription,
  IconAlertCircle,
  IconCheckbox,
  IconRefresh,
  IconBellOff,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

function NotificacionesPage() {
  const { user, profile } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)

  const cargarNotificaciones = async () => {
    setLoading(true)
    try {
      // Intentar cargar de la tabla notificaciones
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // Si la tabla no existe, generar notificaciones desde historial
        console.log('Tabla notificaciones no existe, usando historial')
        await cargarDesdeHistorial()
        return
      }

      setNotificaciones(data || [])
    } catch (error) {
      console.error('Error:', error)
      await cargarDesdeHistorial()
    } finally {
      setLoading(false)
    }
  }

  const cargarDesdeHistorial = async () => {
    try {
      // Obtener reportes del usuario
      const { data: reportes } = await supabase
        .from('reportes')
        .select('id, codigo, estado, updated_at')
        .eq('usuario_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(20)

      // Convertir a notificaciones
      const notifs = (reportes || []).map(r => ({
        id: r.id,
        tipo: 'estado',
        titulo: `Reporte ${r.codigo}`,
        mensaje: `Tu reporte ha sido actualizado a: ${getEstadoLabel(r.estado)}`,
        leida: false,
        created_at: r.updated_at,
        reporte_id: r.id,
      }))

      setNotificaciones(notifs)
    } catch (error) {
      console.error('Error cargando historial:', error)
      setNotificaciones([])
    }
  }

  const getEstadoLabel = (estado) => {
    const estados = {
      nuevo: 'Nuevo',
      en_revision: 'En Revisión',
      asignado: 'Asignado',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado',
    }
    return estados[estado] || estado
  }

  useEffect(() => {
    if (user?.id) {
      cargarNotificaciones()
    }
  }, [user?.id])

  const marcarLeida = async (id) => {
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id)

      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
    } catch (error) {
      // Si falla, solo actualizar localmente
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      )
    }
  }

  const marcarTodasLeidas = async () => {
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('usuario_id', user?.id)

      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
      notif.show({ title: 'Listo', message: 'Todas las notificaciones marcadas como leídas', color: 'green' })
    } catch (error) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    }
  }

  const eliminarNotificacion = async (id) => {
    try {
      await supabase.from('notificaciones').delete().eq('id', id)
      setNotificaciones(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      setNotificaciones(prev => prev.filter(n => n.id !== id))
    }
  }

  const formatFecha = (fecha) => {
    const now = new Date()
    const date = new Date(fecha)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Hace ${diffMins} minutos`
    if (diffHours < 24) return `Hace ${diffHours} horas`
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-PE')
  }

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'estado': return IconFileDescription
      case 'alerta': return IconAlertCircle
      default: return IconBell
    }
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <>
      <Head>
        <title>Notificaciones | Willay Map</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="md" py="md">
          {/* Header */}
          <Paper p="lg" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconBell size={28} />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Notificaciones</Title>
                  <Text opacity={0.9}>Mantente al día con tus reportes</Text>
                </Box>
              </Group>
              {noLeidas > 0 && (
                <Badge size="xl" variant="white" color="dark">
                  {noLeidas} sin leer
                </Badge>
              )}
            </Group>
          </Paper>

          {/* Acciones */}
          <Paper p="md" radius="lg" mb="lg" withBorder>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">{notificaciones.length} notificaciones</Text>
              <Group gap="xs">
                <Tooltip label="Actualizar">
                  <ActionIcon variant="light" onClick={cargarNotificaciones} loading={loading}>
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                {noLeidas > 0 && (
                  <Button size="xs" variant="light" leftSection={<IconCheckbox size={16} />} onClick={marcarTodasLeidas}>
                    Marcar todas como leídas
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Lista de notificaciones */}
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            {loading ? (
              <Center py="xl"><Loader /></Center>
            ) : notificaciones.length === 0 ? (
              <Center py="xl">
                <Box ta="center">
                  <IconBellOff size={48} color="#94a3b8" />
                  <Text c="dimmed" mt="md">No tienes notificaciones</Text>
                  <Text size="sm" c="dimmed">Las actualizaciones de tus reportes aparecerán aquí</Text>
                </Box>
              </Center>
            ) : (
              <Stack gap={0}>
                {notificaciones.map((notificacion, index) => {
                  const IconComponent = getIconByType(notificacion.tipo)
                  return (
                    <Box key={notificacion.id}>
                      <Box
                        p="md"
                        style={{
                          background: notificacion.leida ? 'white' : '#fef3c7',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = notificacion.leida ? 'white' : '#fef3c7' }}
                        onClick={() => marcarLeida(notificacion.id)}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group align="flex-start">
                            <ThemeIcon
                              size={40}
                              radius="xl"
                              color={notificacion.leida ? 'gray' : 'blue'}
                              variant="light"
                            >
                              <IconComponent size={20} />
                            </ThemeIcon>
                            <Box>
                              <Group gap="xs">
                                <Text fw={notificacion.leida ? 500 : 700} size="sm">
                                  {notificacion.titulo}
                                </Text>
                                {!notificacion.leida && (
                                  <Badge size="xs" color="blue">Nueva</Badge>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed" mt={2}>
                                {notificacion.mensaje}
                              </Text>
                              <Text size="xs" c="dimmed" mt={4}>
                                {formatFecha(notificacion.created_at)}
                              </Text>
                            </Box>
                          </Group>
                          <Group gap="xs">
                            {!notificacion.leida && (
                              <Tooltip label="Marcar como leída">
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={(e) => { e.stopPropagation(); marcarLeida(notificacion.id) }}
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Eliminar">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={(e) => { e.stopPropagation(); eliminarNotificacion(notificacion.id) }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Box>
                      {index < notificaciones.length - 1 && <Divider />}
                    </Box>
                  )
                })}
              </Stack>
            )}
          </Paper>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(NotificacionesPage)
