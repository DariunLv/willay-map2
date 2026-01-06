// ============================================================================
// WILLAY MAP - Panel de Alertas y Noticias
// Muestra alertas locales y logros del municipio
// ============================================================================

import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Box, Badge, ActionIcon, Tooltip, Divider } from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconBell,
  IconAlertTriangle,
  IconDroplet,
  IconRoad,
  IconBulb,
  IconX,
  IconChevronRight,
  IconTrophy,
  IconSparkles,
} from '@tabler/icons-react'

const MotionPaper = motion(Paper)
const MotionBox = motion(Box)

// Alertas de ejemplo
const alertasEjemplo = [
  {
    id: 1,
    tipo: 'corte_agua',
    titulo: 'Corte de agua programado',
    descripcion: 'Mañana 8am-2pm en Barrio Bellavista',
    urgencia: 'alta',
    icon: IconDroplet,
    color: '#3b82f6',
  },
  {
    id: 2,
    tipo: 'desvio',
    titulo: 'Desvío de tránsito',
    descripcion: 'Jr. Lima cuadra 3-5 por obras',
    urgencia: 'media',
    icon: IconRoad,
    color: '#f59e0b',
  },
  {
    id: 3,
    tipo: 'mantenimiento',
    titulo: 'Mantenimiento eléctrico',
    descripcion: 'Corte de luz hoy 6pm-8pm zona centro',
    urgencia: 'alta',
    icon: IconBulb,
    color: '#8b5cf6',
  },
]

// Noticias/logros del municipio (ticker)
const noticiasEjemplo = [
  { id: 1, texto: '🎉 ¡50 baches reparados esta semana!', tipo: 'logro' },
  { id: 2, texto: '💡 Nuevo alumbrado LED en Av. El Sol', tipo: 'mejora' },
  { id: 3, texto: '🌳 Inauguración del Parque Ecológico mañana', tipo: 'evento' },
  { id: 4, texto: '✅ 95% de reportes resueltos en diciembre', tipo: 'logro' },
  { id: 5, texto: '🚿 Nueva red de agua potable en Salcedo', tipo: 'mejora' },
]

// Componente Ticker de Noticias
function TickerNoticias() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % noticiasEjemplo.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Paper
      p="sm"
      radius="md"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '1px solid #fbbf24',
        overflow: 'hidden',
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconSparkles size={16} color="white" />
        </Box>
        
        <Box style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Text size="sm" fw={500} c="dark" lineClamp={1}>
                {noticiasEjemplo[currentIndex].texto}
              </Text>
            </MotionBox>
          </AnimatePresence>
        </Box>

        {/* Indicadores */}
        <Group gap={4}>
          {noticiasEjemplo.map((_, idx) => (
            <Box
              key={idx}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: idx === currentIndex ? '#f59e0b' : '#fcd34d',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </Group>
      </Group>
    </Paper>
  )
}

export default function AlertasPanel() {
  const [alertas, setAlertas] = useState(alertasEjemplo)

  const handleDismiss = (id) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id))
  }

  const getUrgenciaColor = (urgencia) => {
    switch (urgencia) {
      case 'alta':
        return '#ef4444'
      case 'media':
        return '#f59e0b'
      case 'baja':
        return '#10b981'
      default:
        return '#64748b'
    }
  }

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      p="lg"
      radius="lg"
      withBorder
      style={{ height: '100%' }}
    >
      <Stack gap="md" h="100%">
        {/* Ticker de noticias */}
        <TickerNoticias />

        <Divider />

        {/* Header de alertas */}
        <Group justify="space-between">
          <Group gap="sm">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBell size={18} color="#ef4444" />
            </Box>
            <Box>
              <Text fw={600} size="sm">Alertas Locales</Text>
              <Text size="xs" c="dimmed">{alertas.length} activas</Text>
            </Box>
          </Group>
        </Group>

        {/* Lista de alertas */}
        <Stack gap="xs" style={{ flex: 1, overflow: 'auto' }}>
          <AnimatePresence>
            {alertas.length === 0 ? (
              <Box ta="center" py="xl">
                <IconTrophy size={40} color="#10b981" style={{ marginBottom: 8 }} />
                <Text size="sm" c="dimmed">¡No hay alertas activas!</Text>
                <Text size="xs" c="dimmed">Tu zona está tranquila</Text>
              </Box>
            ) : (
              alertas.map((alerta, index) => (
                <MotionBox
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      background: `${alerta.color}08`,
                      border: `1px solid ${alerta.color}30`,
                      position: 'relative',
                    }}
                  >
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      {/* Icono */}
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: `${alerta.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <alerta.icon size={18} color={alerta.color} />
                      </Box>

                      {/* Contenido */}
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap="xs" mb={2}>
                          <Text size="sm" fw={600} lineClamp={1}>
                            {alerta.titulo}
                          </Text>
                          <Badge
                            size="xs"
                            variant="filled"
                            style={{ background: getUrgenciaColor(alerta.urgencia) }}
                          >
                            {alerta.urgencia}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {alerta.descripcion}
                        </Text>
                      </Box>

                      {/* Botón cerrar */}
                      <Tooltip label="Descartar">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => handleDismiss(alerta.id)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Paper>
                </MotionBox>
              ))
            )}
          </AnimatePresence>
        </Stack>

        {/* Ver todas */}
        {alertas.length > 0 && (
          <Group
            gap="xs"
            justify="center"
            style={{ cursor: 'pointer' }}
            onClick={() => console.log('Ver todas las alertas')}
          >
            <Text size="xs" c="blue" fw={500}>Ver todas las alertas</Text>
            <IconChevronRight size={14} color="#3b82f6" />
          </Group>
        )}
      </Stack>
    </MotionPaper>
  )
}