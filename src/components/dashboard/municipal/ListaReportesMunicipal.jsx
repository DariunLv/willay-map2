// ============================================
// LISTA REPORTES MUNICIPAL - Tabla con filtros
// Archivo: src/components/dashboard/municipal/ListaReportesMunicipal.jsx
// ============================================

import { useState } from 'react'
import {
  Box,
  Paper,
  Text,
  Group,
  Badge,
  Stack,
  Select,
  TextInput,
  Button,
  ActionIcon,
  Tooltip,
  Center,
  Loader,
  ScrollArea,
  Menu,
  Divider,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconEye,
  IconDotsVertical,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconX,
  IconFileDescription,
  IconTruck,
  IconTool,
  IconChevronRight,
  IconSortDescending,
} from '@tabler/icons-react'

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

export default function ListaReportesMunicipal({
  reportes = [],
  loading = false,
  onVerDetalle,
  onRefresh,
  filtroEstado,
  setFiltroEstado,
  filtroPrioridad,
  setFiltroPrioridad,
  filtroCategoria,
  setFiltroCategoria,
  categorias = [],
}) {
  const [busqueda, setBusqueda] = useState('')

  // Filtrar reportes por búsqueda
  const reportesFiltrados = reportes.filter((r) => {
    if (!busqueda) return true
    const texto = busqueda.toLowerCase()
    return (
      r.codigo?.toLowerCase().includes(texto) ||
      r.descripcion?.toLowerCase().includes(texto) ||
      r.direccion?.toLowerCase().includes(texto) ||
      r.usuario?.full_name?.toLowerCase().includes(texto) ||
      r.categoria?.nombre?.toLowerCase().includes(texto)
    )
  })

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeAgo = (fecha) => {
    const now = new Date()
    const reportDate = new Date(fecha)
    const diffMs = now - reportDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return formatFecha(fecha)
  }

  return (
    <Paper
      radius="xl"
      p="lg"
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={700} size="lg">Reportes Ciudadanos</Text>
          <Text size="sm" c="dimmed">
            {reportesFiltrados.length} de {reportes.length} reportes
          </Text>
        </Box>
        <Tooltip label="Actualizar">
          <ActionIcon
            variant="light"
            color="blue"
            size="lg"
            radius="xl"
            onClick={onRefresh}
            loading={loading}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Filtros */}
      <Paper
        p="sm"
        radius="lg"
        mb="md"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        {/* Búsqueda */}
        <TextInput
          placeholder="Buscar por código, descripción, dirección..."
          leftSection={<IconSearch size={16} />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          radius="lg"
          mb="sm"
          styles={{
            input: { border: '1px solid #e2e8f0' }
          }}
        />

        {/* Filtros en línea */}
        <Group gap="xs">
          <Select
            placeholder="Estado"
            clearable
            value={filtroEstado}
            onChange={setFiltroEstado}
            data={Object.entries(ESTADOS).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            leftSection={<IconFilter size={14} />}
            size="xs"
            radius="md"
            style={{ flex: 1 }}
            styles={{ input: { border: '1px solid #e2e8f0' } }}
          />

          <Select
            placeholder="Prioridad"
            clearable
            value={filtroPrioridad}
            onChange={setFiltroPrioridad}
            data={Object.entries(PRIORIDADES).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            size="xs"
            radius="md"
            style={{ flex: 1 }}
            styles={{ input: { border: '1px solid #e2e8f0' } }}
          />

          <Select
            placeholder="Categoría"
            clearable
            value={filtroCategoria}
            onChange={setFiltroCategoria}
            data={categorias.map((c) => ({
              value: c.id,
              label: c.nombre,
            }))}
            size="xs"
            radius="md"
            style={{ flex: 1 }}
            styles={{ input: { border: '1px solid #e2e8f0' } }}
          />

          {(filtroEstado || filtroPrioridad || filtroCategoria || busqueda) && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              radius="md"
              onClick={() => {
                setFiltroEstado('')
                setFiltroPrioridad('')
                setFiltroCategoria('')
                setBusqueda('')
              }}
            >
              Limpiar
            </Button>
          )}
        </Group>
      </Paper>

      {/* Lista de reportes */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : reportesFiltrados.length === 0 ? (
          <Center py="xl">
            <Box ta="center">
              <IconFileDescription size={48} color="#94a3b8" stroke={1.5} />
              <Text c="dimmed" mt="md" fw={500}>
                No se encontraron reportes
              </Text>
              <Text size="sm" c="dimmed">
                Ajusta los filtros o espera nuevos reportes
              </Text>
            </Box>
          </Center>
        ) : (
          <Stack gap="xs">
            <AnimatePresence>
              {reportesFiltrados.map((reporte, index) => {
                const estado = ESTADOS[reporte.estado] || ESTADOS.nuevo
                const prioridad = PRIORIDADES[reporte.prioridad] || PRIORIDADES.media
                const EstadoIcon = estado.icon

                return (
                  <motion.div
                    key={reporte.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Paper
                      p="sm"
                      radius="lg"
                      withBorder
                      style={{
                        cursor: 'pointer',
                        borderLeft: `4px solid ${reporte.categoria?.color || '#64748b'}`,
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => onVerDetalle && onVerDetalle(reporte)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="sm">
                        {/* Info principal */}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          {/* Código y badges */}
                          <Group gap="xs" mb={6}>
                            <Text
                              size="xs"
                              fw={700}
                              c="dimmed"
                              style={{ fontFamily: 'monospace' }}
                            >
                              {reporte.codigo}
                            </Text>
                            <Badge size="xs" color={prioridad.color} variant="light">
                              {prioridad.label}
                            </Badge>
                            {reporte.estado === 'nuevo' && (
                              <Badge size="xs" color="blue" variant="filled">
                                NUEVO
                              </Badge>
                            )}
                          </Group>

                          {/* Categoría */}
                          <Text
                            size="sm"
                            fw={600}
                            lineClamp={1}
                            style={{ color: reporte.categoria?.color || '#1e293b' }}
                          >
                            {reporte.categoria?.nombre || 'Sin categoría'}
                          </Text>

                          {/* Descripción */}
                          <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                            {reporte.descripcion}
                          </Text>

                          {/* Metadata */}
                          <Group gap="md" mt={8}>
                            <Group gap={4}>
                              <IconCalendar size={12} color="#94a3b8" />
                              <Text size="xs" c="dimmed">
                                {getTimeAgo(reporte.created_at)}
                              </Text>
                            </Group>

                            {reporte.direccion && (
                              <Group gap={4}>
                                <IconMapPin size={12} color="#94a3b8" />
                                <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 120 }}>
                                  {reporte.direccion}
                                </Text>
                              </Group>
                            )}

                            {reporte.usuario?.full_name && (
                              <Group gap={4}>
                                <IconUser size={12} color="#94a3b8" />
                                <Text size="xs" c="dimmed">
                                  {reporte.usuario.full_name.split(' ')[0]}
                                </Text>
                              </Group>
                            )}
                          </Group>
                        </Box>

                        {/* Foto miniatura */}
                        {reporte.foto_url && (
                          <Box
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 10,
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={reporte.foto_url}
                              alt=""
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        )}

                        {/* Estado y acción */}
                        <Box ta="right" style={{ flexShrink: 0 }}>
                          <Badge
                            size="sm"
                            color={estado.color}
                            leftSection={<EstadoIcon size={10} />}
                            variant="light"
                          >
                            {estado.label}
                          </Badge>
                          <Group gap={4} justify="flex-end" mt="xs">
                            <IconChevronRight size={16} color="#94a3b8" />
                          </Group>
                        </Box>
                      </Group>
                    </Paper>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  )
}
