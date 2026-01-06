import { useState } from 'react'
import {
  Paper,
  Text,
  Group,
  Box,
  Badge,
  Button,
  Image,
  Modal,
  Timeline,
  Rating,
  Textarea,
  Tabs,
  ScrollArea,
  ActionIcon,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSend,
  IconClock,
  IconCheck,
  IconTruck,
  IconEye,
  IconMapPin,
  IconPhoto,
  IconChevronRight,
  IconUserCheck,
  IconHammer,
} from '@tabler/icons-react'

// Datos de ejemplo
const reportesData = [
  {
    id: 'RPT-001',
    titulo: 'Bache profundo en Av. El Sol',
    categoria: 'bache',
    estado: 'resuelto',
    prioridad: 'alta',
    direccion: 'Av. El Sol 234, Puno',
    fechaCreacion: '2025-01-05 09:30',
    fechaResolucion: '2025-01-06 11:45',
    imagenAntes: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
    imagenDespues: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400',
    timeline: [
      { estado: 'enviado', fecha: '05 Ene 09:30', mensaje: 'Reporte enviado correctamente' },
      { estado: 'recibido', fecha: '05 Ene 10:15', mensaje: 'Recibido por la municipalidad' },
      { estado: 'asignado', fecha: '05 Ene 14:00', mensaje: 'Asignado a Cuadrilla #3' },
      { estado: 'en_proceso', fecha: '06 Ene 08:00', mensaje: 'Cuadrilla en camino' },
      { estado: 'resuelto', fecha: '06 Ene 11:45', mensaje: 'Problema solucionado' },
    ],
  },
  {
    id: 'RPT-002',
    titulo: 'Poste de luz apagado',
    categoria: 'alumbrado',
    estado: 'en_proceso',
    prioridad: 'media',
    direccion: 'Jr. Lima 456, Puno',
    fechaCreacion: '2025-01-06 15:20',
    imagenAntes: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    timeline: [
      { estado: 'enviado', fecha: '06 Ene 15:20', mensaje: 'Reporte enviado correctamente' },
      { estado: 'recibido', fecha: '06 Ene 15:45', mensaje: 'Recibido por la municipalidad' },
      { estado: 'asignado', fecha: '06 Ene 16:30', mensaje: 'Asignado a Cuadrilla Eléctrica' },
      { estado: 'en_proceso', fecha: '06 Ene 17:00', mensaje: 'Técnicos evaluando el problema' },
    ],
  },
  {
    id: 'RPT-003',
    titulo: 'Acumulación de basura',
    categoria: 'basura',
    estado: 'pendiente',
    prioridad: 'baja',
    direccion: 'Parque Pino, Puno',
    fechaCreacion: '2025-01-06 18:00',
    imagenAntes: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    timeline: [
      { estado: 'enviado', fecha: '06 Ene 18:00', mensaje: 'Reporte enviado correctamente' },
    ],
  },
]

const estadoConfig = {
  enviado: { color: 'gray', icon: IconSend, label: 'Enviado' },
  recibido: { color: 'blue', icon: IconEye, label: 'Recibido' },
  asignado: { color: 'violet', icon: IconUserCheck, label: 'Asignado' },
  en_proceso: { color: 'orange', icon: IconHammer, label: 'En Proceso' },
  resuelto: { color: 'green', icon: IconCheck, label: 'Resuelto' },
}

const categoriaEmoji = {
  bache: '🕳️',
  alumbrado: '💡',
  basura: '🗑️',
  agua: '💧',
}

export default function MisReportes() {
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [activeTab, setActiveTab] = useState('todos')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  const filteredReportes = activeTab === 'todos' 
    ? reportesData 
    : reportesData.filter(r => {
        if (activeTab === 'en_proceso') return r.estado === 'en_proceso' || r.estado === 'pendiente'
        return r.estado === activeTab
      })

  const openModal = (reporte) => {
    setSelectedReporte(reporte)
    setModalOpened(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
          <Group justify="space-between" mb="md">
            <Text fw={700} size="md" c="dark">Mis Reportes</Text>
            <Button variant="light" color="blue" size="xs" radius="lg">
              Ver todos
            </Button>
          </Group>

          {/* Tabs de filtro */}
          <Tabs value={activeTab} onChange={setActiveTab} radius="lg" mb="md">
            <Tabs.List grow>
              <Tabs.Tab value="todos" fw={500}>Todos</Tabs.Tab>
              <Tabs.Tab value="en_proceso" fw={500}>En proceso</Tabs.Tab>
              <Tabs.Tab value="resuelto" fw={500}>Resueltos</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* Lista de reportes */}
          <ScrollArea h={300} offsetScrollbars>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredReportes.map((reporte, index) => (
                    <motion.div
                      key={reporte.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box
                        onClick={() => openModal(reporte)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 14,
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: '#fafbfc',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f1f5f9'
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fafbfc'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        {/* Imagen */}
                        <Box
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={reporte.imagenAntes}
                            alt={reporte.titulo}
                            width={56}
                            height={56}
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>

                        {/* Info */}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" mb={4}>
                            <Text size="xs" style={{ fontSize: 16 }}>
                              {categoriaEmoji[reporte.categoria]}
                            </Text>
                            <Text fw={600} size="sm" lineClamp={1}>
                              {reporte.titulo}
                            </Text>
                          </Group>
                          <Group gap="xs">
                            <IconMapPin size={12} color="#94a3b8" />
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {reporte.direccion}
                            </Text>
                          </Group>
                        </Box>

                        {/* Estado */}
                        <Box style={{ textAlign: 'right' }}>
                          <Badge
                            size="sm"
                            variant="light"
                            color={estadoConfig[reporte.estado === 'pendiente' ? 'enviado' : reporte.estado]?.color}
                            radius="md"
                          >
                            {estadoConfig[reporte.estado === 'pendiente' ? 'enviado' : reporte.estado]?.label}
                          </Badge>
                          <Text size="xs" c="dimmed" mt={4}>
                            {reporte.id}
                          </Text>
                        </Box>

                        <IconChevronRight size={16} color="#94a3b8" />
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </Paper>
      </motion.div>

      {/* Modal de detalle */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="sm">
            <Text size="lg">{categoriaEmoji[selectedReporte?.categoria]}</Text>
            <Text fw={700}>{selectedReporte?.titulo}</Text>
          </Group>
        }
        size="lg"
        radius="xl"
        centered
        styles={{
          header: { borderBottom: '1px solid #f1f5f9', paddingBottom: 16 },
          body: { paddingTop: 16 },
        }}
      >
        {selectedReporte && (
          <Box>
            {/* Código y estado */}
            <Group justify="space-between" mb="lg">
              <Text size="sm" c="dimmed">Código: {selectedReporte.id}</Text>
              <Badge
                size="lg"
                variant="light"
                color={estadoConfig[selectedReporte.estado === 'pendiente' ? 'enviado' : selectedReporte.estado]?.color}
              >
                {estadoConfig[selectedReporte.estado === 'pendiente' ? 'enviado' : selectedReporte.estado]?.label}
              </Badge>
            </Group>

            {/* Imágenes antes/después */}
            <Text fw={600} size="sm" mb="xs">Evidencia</Text>
            <Group grow mb="lg">
              <Box>
                <Text size="xs" c="dimmed" mb={4}>Antes</Text>
                <Image
                  src={selectedReporte.imagenAntes}
                  alt="Antes"
                  radius="md"
                  height={150}
                  fit="cover"
                />
              </Box>
              {selectedReporte.imagenDespues && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>Después</Text>
                  <Image
                    src={selectedReporte.imagenDespues}
                    alt="Después"
                    radius="md"
                    height={150}
                    fit="cover"
                  />
                </Box>
              )}
            </Group>

            {/* Timeline */}
            <Text fw={600} size="sm" mb="md">Seguimiento</Text>
            <Timeline
              active={selectedReporte.timeline.length - 1}
              bulletSize={28}
              lineWidth={2}
              color="blue"
            >
              {selectedReporte.timeline.map((item, index) => {
                const config = estadoConfig[item.estado]
                const Icon = config?.icon || IconClock
                return (
                  <Timeline.Item
                    key={index}
                    bullet={<Icon size={14} />}
                    title={
                      <Text fw={600} size="sm">
                        {config?.label || item.estado}
                      </Text>
                    }
                    color={config?.color}
                  >
                    <Text size="xs" c="dimmed">{item.mensaje}</Text>
                    <Text size="xs" c="dimmed" mt={4}>{item.fecha}</Text>
                  </Timeline.Item>
                )
              })}
            </Timeline>

            {/* Calificación (solo si está resuelto) */}
            {selectedReporte.estado === 'resuelto' && (
              <Box
                mt="xl"
                p="lg"
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: 16,
                }}
              >
                <Text fw={600} size="sm" mb="sm">¿Cómo calificarías la solución?</Text>
                <Rating value={rating} onChange={setRating} size="lg" mb="md" />
                <Textarea
                  placeholder="Comparte tu experiencia (opcional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  radius="md"
                  mb="md"
                />
                <Button
                  variant="gradient"
                  gradient={{ from: '#10b981', to: '#059669' }}
                  radius="md"
                  fullWidth
                  disabled={rating === 0}
                >
                  Enviar calificación
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Modal>
    </>
  )
}