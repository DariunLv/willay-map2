// ============================================================================
// WILLAY MAP - Página Agenda Vecinal
// Listado completo de eventos con filtros y calendario
// ============================================================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Image,
  Badge,
  Group,
  Stack,
  Button,
  ActionIcon,
  SegmentedControl,
  Select,
  Box,
  Paper,
  Tooltip,
  Modal,
  Divider,
  ThemeIcon,
} from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconBell,
  IconBellFilled,
  IconShare,
  IconUsers,
  IconChevronRight,
  IconFilter,
  IconCalendar,
  IconList,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { eventosService } from '@/lib/supabase'
import 'dayjs/locale/es'

const MotionCard = motion(Card)

// Categorías de eventos
const CATEGORIAS_EVENTOS = [
  { value: '', label: 'Todas las categorías' },
  { value: 'salud', label: '🏥 Salud', color: '#10b981' },
  { value: 'cultura', label: '🎭 Cultura', color: '#8b5cf6' },
  { value: 'deporte', label: '⚽ Deporte', color: '#f59e0b' },
  { value: 'limpieza', label: '🧹 Limpieza', color: '#3b82f6' },
  { value: 'mantenimiento', label: '🔧 Mantenimiento', color: '#6b7280' },
  { value: 'educacion', label: '📚 Educación', color: '#ec4899' },
  { value: 'seguridad', label: '🛡️ Seguridad', color: '#ef4444' },
]

// Datos de ejemplo (se reemplazarán con datos reales)
const eventosEjemplo = [
  {
    id: '1',
    titulo: 'Campaña de Vacunación Canina',
    descripcion: 'Vacunación gratuita para mascotas. Traer carnet de vacunación si lo tiene. Se atenderá en orden de llegada.',
    fecha_inicio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    hora_inicio: '09:00',
    hora_fin: '15:00',
    lugar: 'Plaza de Armas',
    direccion: 'Jr. Lima con Jr. Puno',
    latitud: -15.8402,
    longitud: -70.0219,
    categoria: 'salud',
    imagen_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
    organizador: 'Municipalidad Provincial de Puno',
    max_participantes: 200,
    likes: [{ count: 45 }],
    recordatorios: [{ count: 23 }],
  },
  {
    id: '2',
    titulo: 'Limpieza del Lago Titicaca',
    descripcion: 'Jornada de limpieza en las orillas del lago. Se proveerán guantes y bolsas. ¡Tu participación es importante!',
    fecha_inicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    hora_inicio: '07:00',
    hora_fin: '12:00',
    lugar: 'Malecón Bahía de los Incas',
    direccion: 'Av. Costanera s/n',
    latitud: -15.8234,
    longitud: -70.0180,
    categoria: 'limpieza',
    imagen_url: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400',
    organizador: 'Dirección de Medio Ambiente',
    max_participantes: 100,
    likes: [{ count: 78 }],
    recordatorios: [{ count: 56 }],
  },
  {
    id: '3',
    titulo: 'Festival Cultural Puno 2025',
    descripcion: 'Danzas típicas, música y gastronomía puneña. Entrada libre para toda la familia.',
    fecha_inicio: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_fin: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    hora_inicio: '10:00',
    hora_fin: '22:00',
    lugar: 'Estadio Enrique Torres Belón',
    direccion: 'Av. Floral s/n',
    latitud: -15.8350,
    longitud: -70.0150,
    categoria: 'cultura',
    imagen_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
    organizador: 'Dirección de Cultura',
    max_participantes: null,
    likes: [{ count: 234 }],
    recordatorios: [{ count: 156 }],
  },
  {
    id: '4',
    titulo: 'Mantenimiento de Alumbrado - Zona Centro',
    descripcion: 'Se realizará mantenimiento preventivo del alumbrado público en el centro histórico.',
    fecha_inicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    hora_inicio: '08:00',
    hora_fin: '18:00',
    lugar: 'Centro Histórico',
    direccion: 'Jr. Lima, Jr. Puno, Jr. Arequipa',
    latitud: -15.8402,
    longitud: -70.0219,
    categoria: 'mantenimiento',
    imagen_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    organizador: 'ELECTRO PUNO',
    max_participantes: null,
    likes: [{ count: 12 }],
    recordatorios: [{ count: 34 }],
  },
  {
    id: '5',
    titulo: 'Torneo de Fútbol Interbarrial',
    descripcion: 'Gran torneo de fútbol entre barrios. Inscripciones abiertas hasta el 15 de enero.',
    fecha_inicio: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    hora_inicio: '08:00',
    hora_fin: '18:00',
    lugar: 'Complejo Deportivo Municipal',
    direccion: 'Av. El Ejército s/n',
    latitud: -15.8450,
    longitud: -70.0100,
    categoria: 'deporte',
    imagen_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
    organizador: 'Gerencia de Deportes',
    max_participantes: 16,
    likes: [{ count: 89 }],
    recordatorios: [{ count: 67 }],
  },
]

function AgendaPage() {
  const { user, profile } = useAuth()
  const [eventos, setEventos] = useState(eventosEjemplo)
  const [filteredEventos, setFilteredEventos] = useState(eventosEjemplo)
  const [categoria, setCategoria] = useState('')
  const [vistaActiva, setVistaActiva] = useState('lista')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvento, setSelectedEvento] = useState(null)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [likedEventos, setLikedEventos] = useState(new Set())
  const [recordatorios, setRecordatorios] = useState(new Set())
  const [loading, setLoading] = useState(false)

  // Cargar eventos reales
  useEffect(() => {
    const cargarEventos = async () => {
      setLoading(true)
      try {
        const { data, error } = await eventosService.getEventos({ categoria: categoria || null })
        if (data && data.length > 0) {
          setEventos(data)
          setFilteredEventos(data)
        }
      } catch (error) {
        console.error('Error cargando eventos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    cargarEventos()
  }, [categoria])

  // Filtrar eventos
  useEffect(() => {
    let filtered = [...eventos]

    if (categoria) {
      filtered = filtered.filter(e => e.categoria === categoria)
    }

    if (selectedDate) {
      filtered = filtered.filter(e => {
        const fechaEvento = new Date(e.fecha_inicio).toDateString()
        return fechaEvento === selectedDate.toDateString()
      })
    }

    setFilteredEventos(filtered)
  }, [eventos, categoria, selectedDate])

  // Toggle like
  const handleLike = async (eventoId) => {
    const newLiked = new Set(likedEventos)
    if (newLiked.has(eventoId)) {
      newLiked.delete(eventoId)
    } else {
      newLiked.add(eventoId)
    }
    setLikedEventos(newLiked)

    // Llamar al servicio real
    if (user) {
      await eventosService.toggleLikeEvento(eventoId, user.id)
    }
  }

  // Toggle recordatorio
  const handleRecordatorio = async (eventoId) => {
    const newRecordatorios = new Set(recordatorios)
    if (newRecordatorios.has(eventoId)) {
      newRecordatorios.delete(eventoId)
    } else {
      newRecordatorios.add(eventoId)
    }
    setRecordatorios(newRecordatorios)

    // Llamar al servicio real
    if (user) {
      await eventosService.toggleRecordatorio(eventoId, user.id)
    }
  }

  // Obtener color de categoría
  const getCategoriaColor = (cat) => {
    const found = CATEGORIAS_EVENTOS.find(c => c.value === cat)
    return found?.color || '#64748b'
  }

  // Formatear fecha
  const formatFecha = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  // Días con eventos (para calendario)
  const eventDates = eventos.map(e => new Date(e.fecha_inicio).toDateString())

  return (
    <>
      <Head>
        <title>Agenda Vecinal | Willay Map</title>
      </Head>

      <DashboardLayout user={profile} title="Agenda Vecinal">
        <Container size="xl" py="md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              p="xl"
              mb="xl"
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                color: 'white',
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Group gap="sm" mb="xs">
                    <ThemeIcon size={44} radius="xl" color="white" variant="white">
                      <IconCalendarEvent size={24} color="#8b5cf6" />
                    </ThemeIcon>
                    <Title order={2}>Agenda Vecinal</Title>
                  </Group>
                  <Text size="lg" opacity={0.9}>
                    Eventos, campañas y actividades municipales en tu zona
                  </Text>
                </Box>
                <Badge size="xl" variant="white" color="dark" radius="md">
                  {filteredEventos.length} eventos
                </Badge>
              </Group>
            </Paper>
          </motion.div>

          {/* Filtros */}
          <Paper p="md" radius="lg" mb="xl" withBorder>
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="md">
                <Select
                  placeholder="Categoría"
                  data={CATEGORIAS_EVENTOS}
                  value={categoria}
                  onChange={setCategoria}
                  leftSection={<IconFilter size={16} />}
                  clearable
                  style={{ minWidth: 200 }}
                />
                {selectedDate && (
                  <Badge
                    size="lg"
                    variant="light"
                    color="blue"
                    rightSection={
                      <ActionIcon
                        size="xs"
                        variant="transparent"
                        onClick={() => setSelectedDate(null)}
                      >
                        ×
                      </ActionIcon>
                    }
                  >
                    {formatFecha(selectedDate)}
                  </Badge>
                )}
              </Group>

              <SegmentedControl
                value={vistaActiva}
                onChange={setVistaActiva}
                data={[
                  { value: 'lista', label: <Group gap={4}><IconList size={16} /> Lista</Group> },
                  { value: 'calendario', label: <Group gap={4}><IconCalendar size={16} /> Calendario</Group> },
                ]}
              />
            </Group>
          </Paper>

          {/* Contenido */}
          <Grid>
            {/* Lista de eventos */}
            <Grid.Col span={{ base: 12, md: vistaActiva === 'calendario' ? 8 : 12 }}>
              <AnimatePresence mode="wait">
                {filteredEventos.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Paper p="xl" radius="lg" ta="center" withBorder>
                      <IconCalendarEvent size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                      <Text size="lg" fw={500} c="dimmed">
                        No hay eventos para mostrar
                      </Text>
                      <Text size="sm" c="dimmed">
                        Intenta cambiar los filtros o seleccionar otra fecha
                      </Text>
                    </Paper>
                  </motion.div>
                ) : (
                  <Stack gap="md">
                    {filteredEventos.map((evento, index) => (
                      <MotionCard
                        key={evento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        padding="lg"
                        radius="lg"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedEvento(evento)
                          openModal()
                        }}
                      >
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Box style={{ position: 'relative' }}>
                              <Image
                                src={evento.imagen_url}
                                height={160}
                                radius="md"
                                fallbackSrc="https://placehold.co/400x200?text=Evento"
                              />
                              <Badge
                                style={{
                                  position: 'absolute',
                                  top: 10,
                                  left: 10,
                                  background: getCategoriaColor(evento.categoria),
                                }}
                              >
                                {CATEGORIAS_EVENTOS.find(c => c.value === evento.categoria)?.label || evento.categoria}
                              </Badge>
                            </Box>
                          </Grid.Col>

                          <Grid.Col span={{ base: 12, sm: 8 }}>
                            <Stack gap="xs" h="100%" justify="space-between">
                              <Box>
                                <Text fw={600} size="lg" lineClamp={1}>
                                  {evento.titulo}
                                </Text>
                                <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                                  {evento.descripcion}
                                </Text>
                              </Box>

                              <Stack gap={6}>
                                <Group gap="xs">
                                  <IconCalendarEvent size={16} color="#3b82f6" />
                                  <Text size="sm" fw={500}>
                                    {formatFecha(evento.fecha_inicio)}
                                  </Text>
                                </Group>
                                <Group gap="xs">
                                  <IconClock size={16} color="#3b82f6" />
                                  <Text size="sm">
                                    {evento.hora_inicio} - {evento.hora_fin}
                                  </Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} color="#3b82f6" />
                                  <Text size="sm" lineClamp={1}>
                                    {evento.lugar}
                                  </Text>
                                </Group>
                              </Stack>

                              <Divider />

                              <Group justify="space-between">
                                <Group gap="md">
                                  <Tooltip label={likedEventos.has(evento.id) ? 'Quitar me gusta' : 'Me gusta'}>
                                    <ActionIcon
                                      variant="light"
                                      color="red"
                                      size="lg"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleLike(evento.id)
                                      }}
                                    >
                                      {likedEventos.has(evento.id) ? (
                                        <IconHeartFilled size={18} />
                                      ) : (
                                        <IconHeart size={18} />
                                      )}
                                    </ActionIcon>
                                  </Tooltip>
                                  <Text size="sm" c="dimmed">
                                    {evento.likes?.[0]?.count || 0}
                                  </Text>

                                  <Tooltip label={recordatorios.has(evento.id) ? 'Quitar recordatorio' : 'Recordarme'}>
                                    <ActionIcon
                                      variant="light"
                                      color="yellow"
                                      size="lg"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRecordatorio(evento.id)
                                      }}
                                    >
                                      {recordatorios.has(evento.id) ? (
                                        <IconBellFilled size={18} />
                                      ) : (
                                        <IconBell size={18} />
                                      )}
                                    </ActionIcon>
                                  </Tooltip>
                                  <Text size="sm" c="dimmed">
                                    {evento.recordatorios?.[0]?.count || 0}
                                  </Text>
                                </Group>

                                <Button
                                  variant="light"
                                  rightSection={<IconChevronRight size={16} />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEvento(evento)
                                    openModal()
                                  }}
                                >
                                  Ver más
                                </Button>
                              </Group>
                            </Stack>
                          </Grid.Col>
                        </Grid>
                      </MotionCard>
                    ))}
                  </Stack>
                )}
              </AnimatePresence>
            </Grid.Col>

            {/* Calendario (solo si está activo) */}
            {vistaActiva === 'calendario' && (
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper p="md" radius="lg" withBorder style={{ position: 'sticky', top: 20 }}>
                  <Text fw={600} mb="md">Calendario de Eventos</Text>
                  <Calendar
                    locale="es"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    getDayProps={(date) => ({
                      selected: selectedDate?.toDateString() === date.toDateString(),
                      style: eventDates.includes(date.toDateString())
                        ? {
                            backgroundColor: '#dbeafe',
                            borderRadius: '50%',
                          }
                        : undefined,
                    })}
                  />
                  <Divider my="md" />
                  <Text size="sm" c="dimmed" ta="center">
                    Los días marcados tienen eventos programados
                  </Text>
                </Paper>
              </Grid.Col>
            )}
          </Grid>
        </Container>

        {/* Modal de detalle de evento */}
        <Modal
          opened={modalOpened}
          onClose={closeModal}
          size="lg"
          title={
            <Group gap="sm">
              <IconCalendarEvent size={24} color="#3b82f6" />
              <Text fw={600}>Detalle del Evento</Text>
            </Group>
          }
          radius="lg"
        >
          {selectedEvento && (
            <Stack gap="md">
              <Image
                src={selectedEvento.imagen_url}
                height={200}
                radius="md"
                fallbackSrc="https://placehold.co/800x400?text=Evento"
              />

              <Box>
                <Badge
                  mb="xs"
                  style={{ background: getCategoriaColor(selectedEvento.categoria) }}
                >
                  {CATEGORIAS_EVENTOS.find(c => c.value === selectedEvento.categoria)?.label}
                </Badge>
                <Title order={3}>{selectedEvento.titulo}</Title>
              </Box>

              <Text>{selectedEvento.descripcion}</Text>

              <Divider />

              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCalendarEvent size={18} color="#3b82f6" />
                      <Text fw={500}>Fecha</Text>
                    </Group>
                    <Text size="sm" c="dimmed" pl={26}>
                      {formatFecha(selectedEvento.fecha_inicio)}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconClock size={18} color="#3b82f6" />
                      <Text fw={500}>Horario</Text>
                    </Group>
                    <Text size="sm" c="dimmed" pl={26}>
                      {selectedEvento.hora_inicio} - {selectedEvento.hora_fin}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconMapPin size={18} color="#3b82f6" />
                      <Text fw={500}>Lugar</Text>
                    </Group>
                    <Text size="sm" c="dimmed" pl={26}>
                      {selectedEvento.lugar}
                    </Text>
                    <Text size="xs" c="dimmed" pl={26}>
                      {selectedEvento.direccion}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconUsers size={18} color="#3b82f6" />
                      <Text fw={500}>Organizador</Text>
                    </Group>
                    <Text size="sm" c="dimmed" pl={26}>
                      {selectedEvento.organizador}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Divider />

              <Group justify="space-between">
                <Group gap="md">
                  <Button
                    variant={likedEventos.has(selectedEvento.id) ? 'filled' : 'light'}
                    color="red"
                    leftSection={
                      likedEventos.has(selectedEvento.id) ? (
                        <IconHeartFilled size={18} />
                      ) : (
                        <IconHeart size={18} />
                      )
                    }
                    onClick={() => handleLike(selectedEvento.id)}
                  >
                    {likedEventos.has(selectedEvento.id) ? 'Te gusta' : 'Me gusta'}
                  </Button>

                  <Button
                    variant={recordatorios.has(selectedEvento.id) ? 'filled' : 'light'}
                    color="yellow"
                    leftSection={
                      recordatorios.has(selectedEvento.id) ? (
                        <IconBellFilled size={18} />
                      ) : (
                        <IconBell size={18} />
                      )
                    }
                    onClick={() => handleRecordatorio(selectedEvento.id)}
                  >
                    {recordatorios.has(selectedEvento.id) ? 'Recordatorio activo' : 'Recordarme'}
                  </Button>
                </Group>

                <Group>
                  <Button
                    variant="light"
                    leftSection={<IconShare size={18} />}
                    onClick={() => {
                      navigator.share?.({
                        title: selectedEvento.titulo,
                        text: selectedEvento.descripcion,
                        url: window.location.href,
                      })
                    }}
                  >
                    Compartir
                  </Button>
                  <Button
                    leftSection={<IconMapPin size={18} />}
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${selectedEvento.latitud},${selectedEvento.longitud}`,
                        '_blank'
                      )
                    }}
                  >
                    Ver en mapa
                  </Button>
                </Group>
              </Group>
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(AgendaPage, { allowedRoles: ['ciudadano'] })