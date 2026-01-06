import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Title,
  Text,
  Box,
  Paper,
  Group,
  Badge,
  TextInput,
  Select,
  SimpleGrid,
  Image,
  ActionIcon,
  Tooltip,
  Pagination,
  Menu,
  Button,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconFilter,
  IconMapPin,
  IconClock,
  IconCircleCheck,
  IconTool,
  IconEye,
  IconDotsVertical,
  IconTrash,
  IconMessage,
  IconPlus,
  IconSortDescending,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

// Datos de ejemplo expandidos
const reportes = [
  {
    id: 'RPT-001',
    titulo: 'Bache profundo en Av. El Sol',
    categoria: 'bache',
    fecha: '2025-01-05',
    estado: 'resuelto',
    prioridad: 'alta',
    direccion: 'Av. El Sol 234, Puno',
    imagen: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
  },
  {
    id: 'RPT-002',
    titulo: 'Poste de luz caído',
    categoria: 'alumbrado',
    fecha: '2025-01-04',
    estado: 'en_proceso',
    prioridad: 'critica',
    direccion: 'Jr. Lima 456, Puno',
    imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    id: 'RPT-003',
    titulo: 'Acumulación de basura',
    categoria: 'basura',
    fecha: '2025-01-06',
    estado: 'asignado',
    prioridad: 'media',
    direccion: 'Av. Floral 789, Puno',
    imagen: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
  },
  {
    id: 'RPT-004',
    titulo: 'Fuga de agua potable',
    categoria: 'agua',
    fecha: '2025-01-03',
    estado: 'resuelto',
    prioridad: 'alta',
    direccion: 'Jr. Moquegua 123, Puno',
    imagen: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400',
  },
  {
    id: 'RPT-005',
    titulo: 'Señal de tránsito dañada',
    categoria: 'senalizacion',
    fecha: '2025-01-02',
    estado: 'pendiente',
    prioridad: 'baja',
    direccion: 'Av. Simón Bolívar 567, Puno',
    imagen: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=400',
  },
]

const estadoConfig = {
  pendiente: { color: 'gray', icon: IconClock, label: 'Pendiente' },
  asignado: { color: 'blue', icon: IconEye, label: 'Asignado' },
  en_proceso: { color: 'orange', icon: IconTool, label: 'En Proceso' },
  resuelto: { color: 'green', icon: IconCircleCheck, label: 'Resuelto' },
}

const categoriaEmojis = {
  bache: '🕳️',
  alumbrado: '💡',
  basura: '🗑️',
  agua: '💧',
  senalizacion: '🚦',
}

function ReporteCard({ reporte, onClick }) {
  const config = estadoConfig[reporte.estado]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        radius="xl"
        style={{
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Imagen */}
        <Box style={{ position: 'relative' }}>
          <Image
            src={reporte.imagen}
            alt={reporte.titulo}
            height={160}
            fit="cover"
            fallbackSrc="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400"
          />
          <Badge
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
            }}
            variant="filled"
            color={config.color}
            leftSection={<StatusIcon size={12} />}
          >
            {config.label}
          </Badge>
          <Badge
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'white',
              color: '#64748b',
            }}
          >
            {reporte.id}
          </Badge>
        </Box>

        {/* Contenido */}
        <Box p="md">
          <Group gap="xs" mb="xs">
            <Text size="lg">{categoriaEmojis[reporte.categoria]}</Text>
            <Text fw={600} lineClamp={1}>
              {reporte.titulo}
            </Text>
          </Group>

          <Group gap="xs" mb="sm">
            <IconMapPin size={14} color="#94a3b8" />
            <Text size="sm" c="dimmed" lineClamp={1}>
              {reporte.direccion}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              📅 {new Date(reporte.fecha).toLocaleDateString('es-PE')}
            </Text>
            <Menu shadow="md" width={160} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={14} />}>Ver detalle</Menu.Item>
                <Menu.Item leftSection={<IconMessage size={14} />}>Comentar</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                  Eliminar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Box>
      </Paper>
    </motion.div>
  )
}

export default function MisReportesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredReportes = reportes.filter((reporte) => {
    const matchesSearch =
      reporte.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reporte.direccion.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEstado = !estadoFilter || reporte.estado === estadoFilter
    return matchesSearch && matchesEstado
  })

  return (
    <>
      <Head>
        <title>Mis Reportes - Willay Map</title>
        <meta name="description" content="Lista de mis reportes ciudadanos" />
      </Head>

      <DashboardLayout user={{ name: 'Usuario' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Group justify="space-between" mb="xl" wrap="wrap" gap="md">
            <Box>
              <Title order={2} style={{ fontFamily: 'Space Grotesk' }}>
                Mis Reportes
              </Title>
              <Text c="dimmed">
                {filteredReportes.length} reportes encontrados
              </Text>
            </Box>
            <Button
              variant="gradient"
              gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
              leftSection={<IconPlus size={18} />}
              onClick={() => router.push('/ciudadano/nuevo-reporte')}
            >
              Nuevo Reporte
            </Button>
          </Group>
        </motion.div>

        {/* Filtros */}
        <Paper
          p="md"
          radius="xl"
          mb="lg"
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
          }}
        >
          <Group gap="md" wrap="wrap">
            <TextInput
              placeholder="Buscar reportes..."
              leftSection={<IconSearch size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
              radius="md"
            />
            <Select
              placeholder="Filtrar por estado"
              leftSection={<IconFilter size={18} />}
              data={[
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'asignado', label: 'Asignado' },
                { value: 'en_proceso', label: 'En Proceso' },
                { value: 'resuelto', label: 'Resuelto' },
              ]}
              value={estadoFilter}
              onChange={setEstadoFilter}
              clearable
              style={{ minWidth: 180 }}
              radius="md"
            />
            <Tooltip label="Ordenar por fecha">
              <ActionIcon variant="light" size="lg" radius="md">
                <IconSortDescending size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>

        {/* Grid de reportes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchQuery}-${estadoFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredReportes.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {filteredReportes.map((reporte) => (
                  <ReporteCard
                    key={reporte.id}
                    reporte={reporte}
                    onClick={() => router.push(`/ciudadano/reportes/${reporte.id}`)}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Paper
                p="xl"
                radius="xl"
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <IconSearch size={48} color="#94a3b8" stroke={1.5} />
                <Text fw={600} mt="md" c="dark">
                  No se encontraron reportes
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Intenta con otros filtros o crea un nuevo reporte
                </Text>
                <Button
                  variant="light"
                  mt="lg"
                  leftSection={<IconPlus size={18} />}
                  onClick={() => router.push('/ciudadano/nuevo-reporte')}
                >
                  Crear reporte
                </Button>
              </Paper>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Paginación */}
        {filteredReportes.length > 0 && (
          <Group justify="center" mt="xl">
            <Pagination
              total={Math.ceil(filteredReportes.length / 6)}
              value={currentPage}
              onChange={setCurrentPage}
              radius="md"
            />
          </Group>
        )}
      </DashboardLayout>
    </>
  )
}