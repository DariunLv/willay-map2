import { Paper, Text, Group, Box, SimpleGrid, RingProgress, Center } from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react'

const statsData = [
  {
    title: 'Reportes Resueltos',
    value: 15,
    trend: '+12%',
    trendUp: true,
    icon: IconCheck,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  },
  {
    title: 'En Proceso',
    value: 8,
    trend: '+3',
    trendUp: true,
    icon: IconClock,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  },
  {
    title: 'Pendientes',
    value: 5,
    trend: '-2',
    trendUp: false,
    icon: IconAlertTriangle,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  {
    title: 'Ciudadanos Activos',
    value: '1.2K',
    trend: '+156',
    trendUp: true,
    icon: IconUsers,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function StatsCards() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
        {statsData.map((stat, index) => (
          <motion.div key={stat.title} variants={cardVariants}>
            <Paper
              p="lg"
              radius="xl"
              style={{
                background: 'white',
                border: '1px solid rgba(226, 232, 240, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 30px ${stat.color}25`
                e.currentTarget.style.borderColor = `${stat.color}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)'
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)'
              }}
            >
              {/* Fondo decorativo */}
              <Box
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: stat.bgGradient,
                  opacity: 0.5,
                }}
              />

              <Group justify="space-between" align="flex-start" style={{ position: 'relative', zIndex: 1 }}>
                <Box>
                  <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb={4} style={{ letterSpacing: '0.03em' }}>
                    {stat.title}
                  </Text>
                  <Text
                    fw={800}
                    size="xl"
                    style={{
                      fontSize: '2rem',
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: '#1e293b',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </Text>
                </Box>
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${stat.color}40`,
                  }}
                >
                  <stat.icon size={24} color="white" stroke={2} />
                </Box>
              </Group>

              {/* Tendencia */}
              <Group gap={6} mt="md">
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: stat.trendUp ? '#ecfdf5' : '#fef2f2',
                  }}
                >
                  {stat.trendUp ? (
                    <IconTrendingUp size={14} color="#10b981" stroke={2.5} />
                  ) : (
                    <IconTrendingDown size={14} color="#ef4444" stroke={2.5} />
                  )}
                  <Text size="xs" fw={700} c={stat.trendUp ? '#10b981' : '#ef4444'}>
                    {stat.trend}
                  </Text>
                </Box>
                <Text size="xs" c="dimmed">vs. mes anterior</Text>
              </Group>
            </Paper>
          </motion.div>
        ))}
      </SimpleGrid>
    </motion.div>
  )
}

// Componente de estadísticas circulares
export function CircularStats() {
  const data = [
    { label: 'Resueltos', value: 60, color: '#10b981' },
    { label: 'En proceso', value: 25, color: '#3b82f6' },
    { label: 'Pendientes', value: 15, color: '#f59e0b' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Paper
        p="xl"
        radius="xl"
        style={{
          background: 'white',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Text fw={700} size="sm" mb="lg" c="dark">
          Distribución de Reportes
        </Text>

        <Center>
          <RingProgress
            size={180}
            thickness={16}
            roundCaps
            sections={data.map(d => ({ value: d.value, color: d.color }))}
            label={
              <Box ta="center">
                <Text size="xl" fw={800} style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#1e293b' }}>
                  28
                </Text>
                <Text size="xs" c="dimmed">Total</Text>
              </Box>
            }
          />
        </Center>

        {/* Leyenda */}
        <Box mt="lg">
          {data.map((item) => (
            <Group key={item.label} justify="space-between" mb="xs">
              <Group gap="xs">
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 4,
                    background: item.color,
                  }}
                />
                <Text size="sm" c="dimmed">{item.label}</Text>
              </Group>
              <Text size="sm" fw={700} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {item.value}%
              </Text>
            </Group>
          ))}
        </Box>
      </Paper>
    </motion.div>
  )
}