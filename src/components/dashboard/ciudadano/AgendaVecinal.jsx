import { useState } from 'react'
import {
  Paper,
  Text,
  Group,
  Box,
  Badge,
  Button,
  Image,
  ScrollArea,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconBell,
  IconBellFilled,
  IconChevronRight,
} from '@tabler/icons-react'

const eventosData = [
  {
    id: 1,
    titulo: 'Campaña de Vacunación Canina',
    fecha: '2025-01-10',
    hora: '09:00 - 15:00',
    lugar: 'Plaza de Armas',
    categoria: 'Salud',
    color: '#10b981',
    imagen: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    descripcion: 'Vacunación gratuita para perros y gatos.',
    lat: -15.5006,
    lng: -70.1349,
  },
  {
    id: 2,
    titulo: 'Cine al Aire Libre',
    fecha: '2025-01-12',
    hora: '19:00 - 22:00',
    lugar: 'Parque Pino',
    categoria: 'Cultura',
    color: '#8b5cf6',
    imagen: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
    descripcion: 'Función gratuita de película familiar.',
    lat: -15.4976,
    lng: -70.1409,
  },
  {
    id: 3,
    titulo: 'Feria Gastronómica',
    fecha: '2025-01-15',
    hora: '10:00 - 20:00',
    lugar: 'Malecón Ecoturístico',
    categoria: 'Gastronomía',
    color: '#f59e0b',
    imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    descripcion: 'Degustación de platos típicos de la región.',
    lat: -15.5056,
    lng: -70.1289,
  },
  {
    id: 4,
    titulo: 'Aeróbicos Gratuitos',
    fecha: '2025-01-08',
    hora: '06:00 - 07:30',
    lugar: 'Estadio Enrique Torres',
    categoria: 'Deporte',
    color: '#3b82f6',
    imagen: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    descripcion: 'Sesión de ejercicios para toda la familia.',
    lat: -15.5026,
    lng: -70.1319,
  },
  {
    id: 5,
    titulo: 'Limpieza del Lago',
    fecha: '2025-01-20',
    hora: '08:00 - 12:00',
    lugar: 'Bahía de Puno',
    categoria: 'Ambiental',
    color: '#06b6d4',
    imagen: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400',
    descripcion: 'Jornada de limpieza comunitaria.',
    lat: -15.4996,
    lng: -70.1369,
  },
]

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const options = { weekday: 'short', day: 'numeric', month: 'short' }
  return date.toLocaleDateString('es-PE', options)
}

function EventCard({ evento }) {
  const [liked, setLiked] = useState(false)
  const [reminded, setReminded] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{ width: 280, flexShrink: 0 }}
    >
      <Paper
        radius="xl"
        style={{
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Imagen con overlay */}
        <Box style={{ position: 'relative', height: 140 }}>
          <Image
            src={evento.imagen}
            alt={evento.titulo}
            height={140}
            style={{ objectFit: 'cover' }}
          />
          {/* Gradiente overlay */}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
            }}
          />
          {/* Badge de categoría */}
          <Badge
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: evento.color,
              color: 'white',
            }}
            size="sm"
          >
            {evento.categoria}
          </Badge>
          {/* Fecha visual */}
          <Box
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'white',
              borderRadius: 12,
              padding: '8px 12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Text fw={800} size="lg" style={{ lineHeight: 1, color: evento.color }}>
              {new Date(evento.fecha).getDate()}
            </Text>
            <Text size="xs" c="dimmed" tt="uppercase" style={{ lineHeight: 1 }}>
              {new Date(evento.fecha).toLocaleDateString('es-PE', { month: 'short' })}
            </Text>
          </Box>
        </Box>

        {/* Contenido */}
        <Box p="md">
          <Text fw={700} size="sm" lineClamp={2} mb="xs" style={{ minHeight: 40 }}>
            {evento.titulo}
          </Text>

          <Group gap={6} mb="xs">
            <IconClock size={14} color="#94a3b8" />
            <Text size="xs" c="dimmed">{evento.hora}</Text>
          </Group>

          <Group gap={6} mb="md">
            <IconMapPin size={14} color="#94a3b8" />
            <Text size="xs" c="dimmed" lineClamp={1}>{evento.lugar}</Text>
          </Group>

          {/* Botones de acción */}
          <Group justify="space-between">
            <Group gap={4}>
              <Tooltip label={liked ? 'Quitar me gusta' : 'Me gusta'}>
                <ActionIcon
                  variant="subtle"
                  color={liked ? 'red' : 'gray'}
                  onClick={() => setLiked(!liked)}
                  radius="xl"
                >
                  {liked ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                </ActionIcon>
              </Tooltip>
              <Tooltip label={reminded ? 'Recordatorio activo' : 'Recordarme'}>
                <ActionIcon
                  variant="subtle"
                  color={reminded ? 'blue' : 'gray'}
                  onClick={() => setReminded(!reminded)}
                  radius="xl"
                >
                  {reminded ? <IconBellFilled size={18} /> : <IconBell size={18} />}
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Compartir">
                <ActionIcon variant="subtle" color="gray" radius="xl">
                  <IconShare size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Button
              variant="light"
              color="blue"
              size="xs"
              radius="lg"
              rightSection={<IconMapPin size={14} />}
            >
              Ver mapa
            </Button>
          </Group>
        </Box>
      </Paper>
    </motion.div>
  )
}

export default function AgendaVecinal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Paper
        p="lg"
        radius="xl"
        style={{
          background: 'white',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCalendarEvent size={20} color="white" />
            </Box>
            <Box>
              <Text fw={700} size="md" c="dark">Agenda Vecinal</Text>
              <Text size="xs" c="dimmed">Próximos eventos en tu zona</Text>
            </Box>
          </Group>
          <Button variant="subtle" color="gray" size="xs" rightSection={<IconChevronRight size={14} />}>
            Ver calendario
          </Button>
        </Group>

        {/* Carrusel de eventos */}
        <ScrollArea scrollbarSize={6} offsetScrollbars>
          <Box style={{ display: 'flex', gap: 16, paddingBottom: 8 }}>
            {eventosData.map((evento, index) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <EventCard evento={evento} />
              </motion.div>
            ))}
          </Box>
        </ScrollArea>
      </Paper>
    </motion.div>
  )
}