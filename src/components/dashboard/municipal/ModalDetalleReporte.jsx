// ============================================
// MODAL DETALLE REPORTE - Ver y cambiar estado
// Archivo: src/components/dashboard/municipal/ModalDetalleReporte.jsx
// ============================================

import { useState, useEffect } from 'react'
import {
  Modal,
  Box,
  Text,
  Group,
  Badge,
  Stack,
  Image,
  Paper,
  Select,
  Textarea,
  Button,
  SimpleGrid,
  Timeline,
  ThemeIcon,
  Divider,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { motion } from 'framer-motion'
import {
  IconFileDescription,
  IconEye,
  IconTruck,
  IconTool,
  IconCheck,
  IconX,
  IconMapPin,
  IconCalendar,
  IconUser,
  IconPhone,
  IconMail,
  IconHistory,
  IconSend,
  IconPhoto,
  IconExternalLink,
  IconClock,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

// Configuración de estados
const ESTADOS = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: IconFileDescription },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: IconEye },
  asignado: { label: 'Asignado', color: 'violet', icon: IconTruck },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: IconTool },
  resuelto: { label: 'Resuelto', color: 'green', icon: IconCheck },
  rechazado: { label: 'Rechazado', color: 'red', icon: IconX },
}

// Configuración de prioridades
const PRIORIDADES = {
  baja: { label: 'Baja', color: 'green' },
  media: { label: 'Media', color: 'blue' },
  alta: { label: 'Alta', color: 'orange' },
  critica: { label: 'Crítica', color: 'red' },
}

export default function ModalDetalleReporte({
  opened,
  onClose,
  reporte,
  onActualizado,
  userId,
}) {
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad] = useState('')
  const [comentario, setComentario] = useState('')
  const [actualizando, setActualizando] = useState(false)
  const [historial, setHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (opened && reporte) {
      setNuevoEstado(reporte.estado)
      setNuevaPrioridad(reporte.prioridad)
      setComentario('')
      cargarHistorial()
    }
  }, [opened, reporte])

  // Cargar historial de estados
  const cargarHistorial = async () => {
    if (!reporte?.id) return
    setCargandoHistorial(true)
    try {
      const { data, error } = await supabase
        .from('historial_estados')
        .select('*')
        .eq('reporte_id', reporte.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setHistorial(data || [])
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setCargandoHistorial(false)
    }
  }

  // Actualizar estado
  const handleActualizar = async () => {
    if (!reporte) return

    const cambioEstado = nuevoEstado !== reporte.estado
    const cambioPrioridad = nuevaPrioridad !== reporte.prioridad

    if (!cambioEstado && !cambioPrioridad && !comentario.trim()) {
      notifications.show({
        title: 'Sin cambios',
        message: 'Realiza algún cambio antes de guardar',
        color: 'yellow',
      })
      return
    }

    // Validación: rechazado requiere comentario
    if (nuevoEstado === 'rechazado' && !comentario.trim()) {
      notifications.show({
        title: 'Comentario requerido',
        message: 'Debes agregar una justificación para rechazar el reporte',
        color: 'red',
      })
      return
    }

    setActualizando(true)
    try {
      // Actualizar reporte
      const updates = {
        updated_at: new Date().toISOString(),
      }
      if (cambioEstado) updates.estado = nuevoEstado
      if (cambioPrioridad) updates.prioridad = nuevaPrioridad

      const { error: updateError } = await supabase
        .from('reportes')
        .update(updates)
        .eq('id', reporte.id)

      if (updateError) throw updateError

      // Crear registro en historial
      let comentarioFinal = comentario.trim()
      if (!comentarioFinal) {
        const cambios = []
        if (cambioEstado) cambios.push(`Estado: ${ESTADOS[nuevoEstado]?.label}`)
        if (cambioPrioridad) cambios.push(`Prioridad: ${PRIORIDADES[nuevaPrioridad]?.label}`)
        comentarioFinal = cambios.join('. ')
      }

      const { error: historialError } = await supabase
        .from('historial_estados')
        .insert({
          reporte_id: reporte.id,
          estado_anterior: reporte.estado,
          estado_nuevo: nuevoEstado,
          comentario: comentarioFinal,
          usuario_id: userId,
        })

      if (historialError) throw historialError

      notifications.show({
        title: '¡Actualizado!',
        message: `Reporte ${reporte.codigo} actualizado correctamente`,
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      onActualizado && onActualizado()
      onClose()
    } catch (error) {
      console.error('Error actualizando:', error)
      notifications.show({
        title: 'Error',
        message: 'No se pudo actualizar el reporte',
        color: 'red',
      })
    } finally {
      setActualizando(false)
    }
  }

  // Ver en mapa
  const verEnMapa = () => {
    if (reporte?.latitud && reporte?.longitud) {
      window.dispatchEvent(
        new CustomEvent('centerMapMunicipal', {
          detail: { lat: reporte.latitud, lng: reporte.longitud },
        })
      )
      onClose()
    }
  }

  // Formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!reporte) return null

  const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
  const prioridad = PRIORIDADES[reporte.prioridad] || PRIORIDADES.media
  const EstadoIcon = estado.icon

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon
            size={40}
            radius="xl"
            style={{
              background: reporte.categoria?.color || '#3b82f6',
            }}
          >
            <IconFileDescription size={20} color="white" />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="lg">Detalle del Reporte</Text>
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              {reporte.codigo}
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      radius="lg"
      centered
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="md">
        {/* Foto */}
        {reporte.foto_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Paper
              radius="lg"
              style={{ overflow: 'hidden', position: 'relative' }}
            >
              <Image
                src={reporte.foto_url}
                alt="Foto del reporte"
                mah={250}
                fit="cover"
                radius="lg"
              />
              <Tooltip label="Abrir imagen">
                <ActionIcon
                  component="a"
                  href={reporte.foto_url}
                  target="_blank"
                  variant="white"
                  size="md"
                  radius="xl"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
            </Paper>
          </motion.div>
        )}

        {/* Info básica */}
        <SimpleGrid cols={2} spacing="md">
          <Paper p="sm" radius="lg" style={{ background: '#f8fafc' }}>
            <Text size="xs" c="dimmed" mb={4}>Estado Actual</Text>
            <Badge
              size="lg"
              color={estado.color}
              leftSection={<EstadoIcon size={14} />}
            >
              {estado.label}
            </Badge>
          </Paper>

          <Paper p="sm" radius="lg" style={{ background: '#f8fafc' }}>
            <Text size="xs" c="dimmed" mb={4}>Prioridad</Text>
            <Badge size="lg" color={prioridad.color}>
              {prioridad.label}
            </Badge>
          </Paper>

          <Paper p="sm" radius="lg" style={{ background: '#f8fafc' }}>
            <Text size="xs" c="dimmed" mb={4}>Categoría</Text>
            <Badge
              size="lg"
              style={{
                background: reporte.categoria?.color || '#64748b',
                color: 'white',
              }}
            >
              {reporte.categoria?.nombre || 'Sin categoría'}
            </Badge>
          </Paper>

          <Paper p="sm" radius="lg" style={{ background: '#f8fafc' }}>
            <Text size="xs" c="dimmed" mb={4}>Fecha de Reporte</Text>
            <Group gap={4}>
              <IconCalendar size={14} color="#64748b" />
              <Text size="sm" fw={500}>
                {formatFechaCorta(reporte.created_at)}
              </Text>
            </Group>
          </Paper>
        </SimpleGrid>

        {/* Descripción */}
        <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
          <Text size="xs" c="dimmed" mb="xs">Descripción del problema</Text>
          <Text size="sm">{reporte.descripcion}</Text>
        </Paper>

        {/* Ubicación */}
        {(reporte.direccion || (reporte.latitud && reporte.longitud)) && (
          <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">Ubicación</Text>
              {reporte.latitud && reporte.longitud && (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconMapPin size={14} />}
                  onClick={verEnMapa}
                  radius="md"
                >
                  Ver en mapa
                </Button>
              )}
            </Group>
            {reporte.direccion && (
              <Group gap={6}>
                <IconMapPin size={16} color="#3b82f6" />
                <Text size="sm">{reporte.direccion}</Text>
              </Group>
            )}
            {reporte.latitud && reporte.longitud && (
              <Text size="xs" c="dimmed" mt={4}>
                Coordenadas: {reporte.latitud.toFixed(6)}, {reporte.longitud.toFixed(6)}
              </Text>
            )}
          </Paper>
        )}

        {/* Ciudadano */}
        <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
          <Text size="xs" c="dimmed" mb="xs">Reportado por</Text>
          <Group gap="md">
            <Group gap={6}>
              <IconUser size={16} color="#64748b" />
              <Text size="sm" fw={500}>
                {reporte.usuario?.full_name || 'Ciudadano anónimo'}
              </Text>
            </Group>
            {reporte.usuario?.email && (
              <Group gap={6}>
                <IconMail size={14} color="#64748b" />
                <Text size="xs" c="dimmed">{reporte.usuario.email}</Text>
              </Group>
            )}
            {reporte.usuario?.telefono && (
              <Group gap={6}>
                <IconPhone size={14} color="#64748b" />
                <Text size="xs" c="dimmed">{reporte.usuario.telefono}</Text>
              </Group>
            )}
          </Group>
        </Paper>

        {/* Historial */}
        {historial.length > 0 && (
          <Paper p="md" radius="lg" style={{ background: '#f8fafc' }}>
            <Group gap={6} mb="md">
              <IconHistory size={16} color="#64748b" />
              <Text size="xs" c="dimmed" fw={600}>Historial de Estados</Text>
            </Group>

            {cargandoHistorial ? (
              <Center py="md"><Loader size="sm" /></Center>
            ) : (
              <Timeline active={-1} bulletSize={24} lineWidth={2}>
                {historial.slice(0, 5).map((h, i) => {
                  const estadoH = ESTADOS[h.estado_nuevo] || ESTADOS.nuevo
                  const IconH = estadoH.icon
                  return (
                    <Timeline.Item
                      key={h.id}
                      bullet={<IconH size={12} />}
                      color={estadoH.color}
                    >
                      <Group justify="space-between">
                        <Box>
                          <Badge size="xs" color={estadoH.color}>
                            {estadoH.label}
                          </Badge>
                          {h.comentario && (
                            <Text size="xs" c="dimmed" mt={4}>
                              {h.comentario}
                            </Text>
                          )}
                        </Box>
                        <Text size="xs" c="dimmed">
                          {formatFechaCorta(h.created_at)}
                        </Text>
                      </Group>
                    </Timeline.Item>
                  )
                })}
              </Timeline>
            )}
          </Paper>
        )}

        <Divider my="sm" />

        {/* Acciones de gestión */}
        <Paper
          p="md"
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #a7f3d0',
          }}
        >
          <Text fw={700} mb="md" c="green.8">
            Gestionar Reporte
          </Text>

          <SimpleGrid cols={2} spacing="md" mb="md">
            <Select
              label="Cambiar estado"
              value={nuevoEstado}
              onChange={setNuevoEstado}
              data={Object.entries(ESTADOS).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              radius="md"
            />

            <Select
              label="Cambiar prioridad"
              value={nuevaPrioridad}
              onChange={setNuevaPrioridad}
              data={Object.entries(PRIORIDADES).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              radius="md"
            />
          </SimpleGrid>

          <Textarea
            label="Comentario / Observaciones"
            placeholder={
              nuevoEstado === 'rechazado'
                ? 'Justificación del rechazo (obligatorio)...'
                : 'Agregar comentario opcional...'
            }
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            minRows={2}
            radius="md"
            mb="md"
            required={nuevoEstado === 'rechazado'}
          />

          <Button
            fullWidth
            size="md"
            radius="lg"
            onClick={handleActualizar}
            loading={actualizando}
            leftSection={<IconSend size={18} />}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            Guardar Cambios
          </Button>
        </Paper>
      </Stack>
    </Modal>
  )
}
