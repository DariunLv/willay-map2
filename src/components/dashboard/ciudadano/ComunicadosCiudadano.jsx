// ============================================
// COMUNICADOS CIUDADANO - Muestra avisos municipales
// Archivo: src/components/dashboard/ciudadano/ComunicadosCiudadano.jsx
// ============================================

import { useState, useEffect } from 'react'
import {
  Paper,
  Text,
  Group,
  Box,
  Badge,
  Stack,
  ThemeIcon,
  Loader,
  Center,
  Modal,
  Image,
  Button,
  ScrollArea,
  Collapse,
} from '@mantine/core'
import {
  IconSpeakerphone,
  IconAlertCircle,
  IconInfoCircle,
  IconCalendar,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const TIPOS_COMUNICADO = {
  aviso: { label: 'Aviso', color: 'blue', icon: IconInfoCircle },
  alerta: { label: 'Alerta', color: 'red', icon: IconAlertCircle },
  evento: { label: 'Evento', color: 'green', icon: IconCalendar },
  noticia: { label: 'Noticia', color: 'violet', icon: IconSpeakerphone },
}

export default function ComunicadosCiudadano() {
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComunicado, setSelectedComunicado] = useState(null)
  const [verTodos, setVerTodos] = useState(false)

  useEffect(() => {
    const cargarComunicados = async () => {
      try {
        const { data, error } = await supabase
          .from('comunicados')
          .select('*')
          .eq('activo', true)
          .order('destacado', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setComunicados(data || [])
      } catch (error) {
        console.error('Error cargando comunicados:', error)
        setComunicados([])
      } finally {
        setLoading(false)
      }
    }

    cargarComunicados()

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('comunicados-ciudadano')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comunicados' }, () => {
        cargarComunicados()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTipoInfo = (tipo) => TIPOS_COMUNICADO[tipo] || TIPOS_COMUNICADO.aviso

  if (loading) {
    return (
      <Paper p="lg" radius="xl" withBorder>
        <Center py="md"><Loader size="sm" /></Center>
      </Paper>
    )
  }

  if (comunicados.length === 0) {
    return null // No mostrar nada si no hay comunicados
  }

  const comunicadosDestacados = comunicados.filter(c => c.destacado)
  const comunicadosNormales = comunicados.filter(c => !c.destacado)
  const comunicadosMostrados = verTodos ? comunicados : comunicados.slice(0, 3)

  return (
    <>
      <Paper
        p="lg"
        radius="xl"
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #fcd34d',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size={40} radius="xl" color="orange" variant="filled">
              <IconSpeakerphone size={22} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg">Comunicados Municipales</Text>
              <Text size="xs" c="dimmed">Avisos y noticias de tu municipalidad</Text>
            </Box>
          </Group>
          {comunicados.length > 3 && (
            <Button
              variant="subtle"
              color="orange"
              size="xs"
              onClick={() => setVerTodos(!verTodos)}
            >
              {verTodos ? 'Ver menos' : `Ver todos (${comunicados.length})`}
            </Button>
          )}
        </Group>

        {/* Lista de comunicados */}
        <Stack gap="sm">
          {comunicadosMostrados.map((comunicado) => {
            const tipoInfo = getTipoInfo(comunicado.tipo)
            const TipoIcon = tipoInfo.icon

            return (
              <Paper
                key={comunicado.id}
                p="sm"
                radius="lg"
                style={{
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: comunicado.destacado ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                }}
                onClick={() => setSelectedComunicado(comunicado)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <ThemeIcon size={36} radius="xl" color={tipoInfo.color} variant="light">
                      <TipoIcon size={18} />
                    </ThemeIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" mb={2}>
                        <Badge size="xs" color={tipoInfo.color}>{tipoInfo.label}</Badge>
                        {comunicado.destacado && (
                          <Badge size="xs" color="orange">Destacado</Badge>
                        )}
                      </Group>
                      <Text fw={600} size="sm" lineClamp={1}>
                        {comunicado.titulo}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {comunicado.contenido}
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {formatFecha(comunicado.fecha_publicacion || comunicado.created_at)}
                    </Text>
                    <IconChevronRight size={16} color="#94a3b8" />
                  </Group>
                </Group>
              </Paper>
            )
          })}
        </Stack>
      </Paper>

      {/* Modal de detalle */}
      <Modal
        opened={!!selectedComunicado}
        onClose={() => setSelectedComunicado(null)}
        title={
          <Group gap="sm">
            {selectedComunicado && (
              <>
                <ThemeIcon
                  size={36}
                  radius="xl"
                  color={getTipoInfo(selectedComunicado.tipo).color}
                >
                  {(() => {
                    const Icon = getTipoInfo(selectedComunicado.tipo).icon
                    return <Icon size={20} />
                  })()}
                </ThemeIcon>
                <Text fw={700}>Comunicado Municipal</Text>
              </>
            )}
          </Group>
        }
        size="lg"
        radius="lg"
        centered
        zIndex={1000}
      >
        {selectedComunicado && (
          <Stack>
            {/* Imagen */}
            {selectedComunicado.imagen_url && (
              <Image
                src={selectedComunicado.imagen_url}
                radius="md"
                mah={250}
                fit="cover"
              />
            )}

            {/* Badges */}
            <Group gap="xs">
              <Badge color={getTipoInfo(selectedComunicado.tipo).color}>
                {getTipoInfo(selectedComunicado.tipo).label}
              </Badge>
              {selectedComunicado.destacado && (
                <Badge color="orange">Destacado</Badge>
              )}
            </Group>

            {/* Título */}
            <Text fw={700} size="xl">{selectedComunicado.titulo}</Text>

            {/* Fecha */}
            <Text size="sm" c="dimmed">
              📅 Publicado: {formatFecha(selectedComunicado.fecha_publicacion || selectedComunicado.created_at)}
            </Text>

            {/* Contenido */}
            <Paper p="md" radius="md" style={{ background: '#f8fafc' }}>
              <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {selectedComunicado.contenido}
              </Text>
            </Paper>

            {/* Botón cerrar */}
            <Button
              variant="light"
              color="gray"
              onClick={() => setSelectedComunicado(null)}
            >
              Cerrar
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  )
}