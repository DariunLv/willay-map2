import { useState } from 'react'
import { Paper, Text, Group, Box, SegmentedControl, ActionIcon, Tooltip, Badge } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconFilter, IconMaximize, IconCurrentLocation, IconFlame, IconMapPin } from '@tabler/icons-react'
import dynamic from 'next/dynamic'

// Importación dinámica del mapa para evitar SSR
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <Box
      style={{
        height: '100%',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text c="dimmed">Cargando mapa...</Text>
    </Box>
  ),
})

// Datos de ejemplo para el mapa
const sampleReports = [
  { id: 1, lat: -15.5006, lng: -70.1349, type: 'bache', priority: 'alta', status: 'pending', title: 'Bache profundo' },
  { id: 2, lat: -15.5056, lng: -70.1289, type: 'alumbrado', priority: 'media', status: 'inProgress', title: 'Poste dañado' },
  { id: 3, lat: -15.4976, lng: -70.1409, type: 'basura', priority: 'baja', status: 'resolved', title: 'Basura acumulada' },
  { id: 4, lat: -15.5026, lng: -70.1319, type: 'agua', priority: 'critica', status: 'pending', title: 'Fuga de agua' },
  { id: 5, lat: -15.4996, lng: -70.1369, type: 'bache', priority: 'alta', status: 'inProgress', title: 'Hueco en vereda' },
  { id: 6, lat: -15.5086, lng: -70.1259, type: 'alumbrado', priority: 'media', status: 'resolved', title: 'Luz apagada' },
  { id: 7, lat: -15.4946, lng: -70.1389, type: 'basura', priority: 'baja', status: 'pending', title: 'Contenedor lleno' },
  { id: 8, lat: -15.5036, lng: -70.1299, type: 'agua', priority: 'alta', status: 'inProgress', title: 'Alcantarilla tapada' },
]

const categoryFilters = [
  { value: 'todos', label: 'Todos' },
  { value: 'bache', label: '🕳️ Baches' },
  { value: 'alumbrado', label: '💡 Alumbrado' },
  { value: 'basura', label: '🗑️ Basura' },
  { value: 'agua', label: '💧 Agua' },
]

export default function DashboardMap({ height = 400 }) {
  const [category, setCategory] = useState('todos')
  const [viewMode, setViewMode] = useState('markers')

  const filteredReports = category === 'todos' 
    ? sampleReports 
    : sampleReports.filter(r => r.type === category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Paper
        p="lg"
        radius="xl"
        style={{
          background: 'white',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header del mapa */}
        <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
          <Group gap="sm">
            <Text fw={700} size="md" c="dark">Mapa de Reportes</Text>
            <Badge variant="light" color="blue" size="sm">
              {filteredReports.length} activos
            </Badge>
          </Group>

          <Group gap="xs">
            {/* Toggle Heatmap/Markers */}
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              size="xs"
              radius="lg"
              data={[
                { 
                  value: 'markers', 
                  label: (
                    <Group gap={4}>
                      <IconMapPin size={14} />
                      <span>Puntos</span>
                    </Group>
                  ),
                },
                { 
                  value: 'heatmap', 
                  label: (
                    <Group gap={4}>
                      <IconFlame size={14} />
                      <span>Calor</span>
                    </Group>
                  ),
                },
              ]}
              styles={{
                root: { background: '#f1f5f9' },
                indicator: { background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' },
              }}
            />

            <Tooltip label="Mi ubicación">
              <ActionIcon variant="light" color="blue" radius="lg" size="lg">
                <IconCurrentLocation size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Pantalla completa">
              <ActionIcon variant="light" color="gray" radius="lg" size="lg">
                <IconMaximize size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Filtros por categoría */}
        <Box mb="md" style={{ overflowX: 'auto' }}>
          <SegmentedControl
            value={category}
            onChange={setCategory}
            data={categoryFilters}
            size="xs"
            radius="lg"
            fullWidth
            styles={{
              root: { background: '#f8fafc', padding: 4 },
              indicator: { background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
              label: { fontSize: '12px', fontWeight: 500 },
            }}
          />
        </Box>

        {/* Contenedor del mapa */}
        <Box
          style={{
            height: height,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          <MapComponent 
            reports={filteredReports} 
            viewMode={viewMode}
            height={height}
          />
        </Box>

        {/* Leyenda */}
        <Group justify="center" mt="md" gap="lg" wrap="wrap">
          {[
            { label: 'Crítica', color: '#ef4444' },
            { label: 'Alta', color: '#f59e0b' },
            { label: 'Media', color: '#3b82f6' },
            { label: 'Baja', color: '#10b981' },
          ].map((item) => (
            <Group key={item.label} gap={6}>
              <Box
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: item.color,
                  boxShadow: `0 2px 6px ${item.color}50`,
                }}
              />
              <Text size="xs" c="dimmed" fw={500}>{item.label}</Text>
            </Group>
          ))}
        </Group>
      </Paper>
    </motion.div>
  )
}