import { Title, Text, Box, Group, Badge, SegmentedControl, Paper } from '@mantine/core'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconMapPin, IconFlame, IconAlertCircle, IconCircleCheck, IconClock } from '@tabler/icons-react'
import dynamic from 'next/dynamic'

const PublicMap = dynamic(() => import('@/components/map/PublicMap'), { ssr: false })

// Datos de ejemplo para demostración
const sampleReports = [
  { lat: -15.5006, lng: -70.1349, type: 'bache', status: 'pending' },
  { lat: -15.5056, lng: -70.1289, type: 'alumbrado', status: 'inProgress' },
  { lat: -15.4976, lng: -70.1409, type: 'basura', status: 'resolved' },
  { lat: -15.5026, lng: -70.1319, type: 'agua', status: 'pending' },
  { lat: -15.4996, lng: -70.1369, type: 'bache', status: 'inProgress' },
  { lat: -15.5086, lng: -70.1259, type: 'alumbrado', status: 'resolved' },
  { lat: -15.4946, lng: -70.1389, type: 'basura', status: 'pending' },
  { lat: -15.5036, lng: -70.1299, type: 'agua', status: 'resolved' },
]

const stats = [
  { icon: IconAlertCircle, label: 'Pendientes', value: 12, color: '#ef4444' },
  { icon: IconClock, label: 'En proceso', value: 8, color: '#f59e0b' },
  { icon: IconCircleCheck, label: 'Resueltos hoy', value: 15, color: '#10b981' },
]

export default function PublicMapSection() {
  const [filter, setFilter] = useState('all')

  const filteredReports = filter === 'all' 
    ? sampleReports 
    : sampleReports.filter(r => r.status === filter)

  return (
    <section
      id="mapa"
      style={{
        padding: '100px 0',
        background: 'white',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <Badge size="lg" variant="light" color="blue" mb="md" leftSection={<IconMapPin size={14} />}>
            Mapa público
          </Badge>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 16,
            }}
          >
            Explora los reportes de tu ciudad
          </Title>
          <Text
            size="lg"
            style={{
              color: '#64748b',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Visualiza en tiempo real los problemas reportados y su estado de resolución. Información pública y transparente.
          </Text>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: 32 }}
        >
          <Group justify="center" gap="md" wrap="wrap">
            {stats.map((stat, index) => (
              <Paper
                key={stat.label}
                p="md"
                radius="lg"
                style={{
                  border: '1px solid #e2e8f0',
                  minWidth: 160,
                }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <stat.icon size={20} color={stat.color} />
                  </Box>
                  <div>
                    <Text size="xl" fw={700} style={{ color: stat.color, fontFamily: 'Space Grotesk, sans-serif' }}>
                      {stat.value}
                    </Text>
                    <Text size="xs" c="dimmed">{stat.label}</Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </Group>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            data={[
              { label: 'Todos', value: 'all' },
              { label: 'Pendientes', value: 'pending' },
              { label: 'En proceso', value: 'inProgress' },
              { label: 'Resueltos', value: 'resolved' },
            ]}
            size="md"
            radius="lg"
            styles={{
              root: {
                background: '#f1f5f9',
                padding: 4,
              },
              indicator: {
                background: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </motion.div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box
            style={{
              height: 500,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
            }}
          >
            <PublicMap points={filteredReports} height={500} />
          </Box>
        </motion.div>

        {/* Leyenda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: 24 }}
        >
          <Group justify="center" gap="xl" wrap="wrap">
            {[
              { label: 'Baches', color: '#ef4444', emoji: '🕳️' },
              { label: 'Alumbrado', color: '#f59e0b', emoji: '💡' },
              { label: 'Basura', color: '#10b981', emoji: '🗑️' },
              { label: 'Agua', color: '#3b82f6', emoji: '💧' },
            ].map((item) => (
              <Group key={item.label} gap="xs">
                <Box
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}
                >
                  {item.emoji}
                </Box>
                <Text size="sm" c="dimmed">{item.label}</Text>
              </Group>
            ))}
          </Group>
        </motion.div>
      </div>
    </section>
  )
}