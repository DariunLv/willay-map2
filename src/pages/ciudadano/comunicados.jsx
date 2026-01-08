// ============================================
// COMUNICADOS CIUDADANO - CORREGIDO
// Archivo: src/pages/ciudadano/comunicados.jsx
// ============================================

import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Box,
  Badge,
  ThemeIcon,
  Stack,
  Loader,
  Center,
  Modal,
  Image,
  Button,
  SimpleGrid,
  Card,
  ActionIcon,
  TextInput,
  Tabs,
} from '@mantine/core'
import {
  IconSpeakerphone,
  IconAlertCircle,
  IconInfoCircle,
  IconCalendar,
  IconChevronRight,
  IconSearch,
  IconX,
  IconClock,
  IconStar,
  IconBell,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const TIPOS_COMUNICADO = {
  aviso: { label: 'Aviso General', color: 'blue', icon: IconInfoCircle },
  alerta: { label: 'Alerta Importante', color: 'red', icon: IconAlertCircle },
  evento: { label: 'Evento', color: 'green', icon: IconCalendar },
  noticia: { label: 'Noticia', color: 'violet', icon: IconSpeakerphone },
}

function ComunicadosCiudadanoPage() {
  const { profile } = useAuth()
  const [comunicados, setComunicados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComunicado, setSelectedComunicado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargarComunicados = async () => {
      try {
        const { data, error } = await supabase
          .from('comunicados')
          .select('*')
          .eq('activo', true)
          .order('destacado', { ascending: false })
          .order('created_at', { ascending: false })

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

    const subscription = supabase
      .channel('comunicados-ciudadano-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comunicados' }, () => {
        cargarComunicados()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getTipoInfo = (tipo) => TIPOS_COMUNICADO[tipo] || TIPOS_COMUNICADO.aviso

  // Filtrar comunicados
  const comunicadosFiltrados = comunicados.filter(c => {
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo
    const matchBusqueda = !busqueda || 
      c.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.contenido?.toLowerCase().includes(busqueda.toLowerCase())
    return matchTipo && matchBusqueda
  })

  const comunicadosDestacados = comunicadosFiltrados.filter(c => c.destacado)
  const comunicadosNormales = comunicadosFiltrados.filter(c => !c.destacado)

  // Stats
  const stats = {
    total: comunicados.length,
    alertas: comunicados.filter(c => c.tipo === 'alerta').length,
    eventos: comunicados.filter(c => c.tipo === 'evento').length,
    noticias: comunicados.filter(c => c.tipo === 'noticia').length,
  }

  return (
    <>
      <Head>
        <title>Comunicados | Willay Map</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper
            p="xl"
            radius="xl"
            mb="xl"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />

            <Group justify="space-between" align="flex-start" style={{ position: 'relative', zIndex: 1 }}>
              <Group gap="lg">
                <ThemeIcon
                  size={70}
                  radius="xl"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <IconSpeakerphone size={36} color="white" />
                </ThemeIcon>
                <Box>
                  <Title order={1} c="white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Comunicados Municipales
                  </Title>
                  <Text c="white" opacity={0.9} size="lg" mt={4}>
                    Mantente informado con los avisos oficiales
                  </Text>
                </Box>
              </Group>

              <Box ta="right" visibleFrom="md">
                <Badge size="xl" variant="white" color="dark" radius="lg">
                  {stats.total} comunicados
                </Badge>
              </Box>
            </Group>

            {/* Mini stats */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} mt="xl">
              {[
                { label: 'Total', value: stats.total, color: 'white' },
                { label: 'Alertas', value: stats.alertas, color: '#fecaca' },
                { label: 'Eventos', value: stats.eventos, color: '#bbf7d0' },
                { label: 'Noticias', value: stats.noticias, color: '#ddd6fe' },
              ].map((stat) => (
                <Paper
                  key={stat.label}
                  p="md"
                  radius="lg"
                  style={{ background: 'rgba(255,255,255,0.15)', textAlign: 'center' }}
                >
                  <Text size="xl" fw={800} style={{ color: stat.color }}>{stat.value}</Text>
                  <Text size="xs" c="white" opacity={0.8}>{stat.label}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Filtros */}
          <Paper p="md" radius="lg" mb="xl" withBorder>
            <Group justify="space-between">
              <TextInput
                placeholder="Buscar comunicados..."
                leftSection={<IconSearch size={16} />}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, maxWidth: 400 }}
                radius="lg"
              />
              <Tabs value={filtroTipo} onChange={setFiltroTipo} radius="lg">
                <Tabs.List>
                  <Tabs.Tab value="todos" leftSection={<IconSpeakerphone size={14} />}>
                    Todos
                  </Tabs.Tab>
                  <Tabs.Tab value="alerta" leftSection={<IconAlertCircle size={14} />} color="red">
                    Alertas
                  </Tabs.Tab>
                  <Tabs.Tab value="evento" leftSection={<IconCalendar size={14} />} color="green">
                    Eventos
                  </Tabs.Tab>
                  <Tabs.Tab value="noticia" leftSection={<IconSpeakerphone size={14} />} color="violet">
                    Noticias
                  </Tabs.Tab>
                  <Tabs.Tab value="aviso" leftSection={<IconInfoCircle size={14} />} color="blue">
                    Avisos
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>
          </Paper>

          {loading ? (
            <Center py="xl">
              <Loader size="lg" />
            </Center>
          ) : comunicadosFiltrados.length === 0 ? (
            <Paper p="xl" radius="xl" withBorder ta="center">
              <ThemeIcon size={80} radius="xl" color="gray" variant="light" mx="auto" mb="md">
                <IconSpeakerphone size={40} />
              </ThemeIcon>
              <Title order={3} c="dimmed">No hay comunicados</Title>
              <Text c="dimmed" size="sm" mt="xs">
                {busqueda || filtroTipo !== 'todos' 
                  ? 'No se encontraron comunicados con esos filtros'
                  : 'Aún no hay comunicados publicados'}
              </Text>
            </Paper>
          ) : (
            <>
              {/* Comunicados destacados */}
              {comunicadosDestacados.length > 0 && (
                <Box mb="xl">
                  <Group gap="xs" mb="md">
                    <IconStar size={20} color="#f59e0b" fill="#f59e0b" />
                    <Title order={4}>Destacados</Title>
                  </Group>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    {comunicadosDestacados.map((comunicado) => {
                      const tipoInfo = getTipoInfo(comunicado.tipo)
                      const TipoIcon = tipoInfo.icon

                      return (
                        <Card
                          key={comunicado.id}
                          p={0}
                          radius="xl"
                          withBorder
                          style={{
                            cursor: 'pointer',
                            overflow: 'hidden',
                            border: '2px solid #f59e0b',
                          }}
                          onClick={() => setSelectedComunicado(comunicado)}
                        >
                          {comunicado.imagen_url ? (
                            <Box style={{ position: 'relative', height: 180 }}>
                              <Image
                                src={comunicado.imagen_url}
                                height={180}
                                fit="cover"
                              />
                              <Box
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                  padding: 16,
                                }}
                              >
                                <Badge color={tipoInfo.color} mb="xs">{tipoInfo.label}</Badge>
                                <Text c="white" fw={700} size="lg" lineClamp={2}>
                                  {comunicado.titulo}
                                </Text>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              p="xl"
                              style={{
                                background: `linear-gradient(135deg, var(--mantine-color-${tipoInfo.color}-6) 0%, var(--mantine-color-${tipoInfo.color}-8) 100%)`,
                                minHeight: 180,
                              }}
                            >
                              <Group justify="space-between" mb="md">
                                <Badge variant="white" color="dark">{tipoInfo.label}</Badge>
                                <Badge variant="white" color="orange" leftSection={<IconStar size={12} />}>
                                  Destacado
                                </Badge>
                              </Group>
                              <Title order={3} c="white" lineClamp={2}>
                                {comunicado.titulo}
                              </Title>
                              <Text c="white" opacity={0.9} size="sm" mt="sm" lineClamp={2}>
                                {comunicado.contenido}
                              </Text>
                            </Box>
                          )}
                          <Box p="md">
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                <IconClock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                {formatFecha(comunicado.fecha_publicacion || comunicado.created_at)}
                              </Text>
                              <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />}>
                                Leer más
                              </Button>
                            </Group>
                          </Box>
                        </Card>
                      )
                    })}
                  </SimpleGrid>
                </Box>
              )}

              {/* Comunicados normales */}
              {comunicadosNormales.length > 0 && (
                <Box>
                  {comunicadosDestacados.length > 0 && (
                    <Group gap="xs" mb="md">
                      <IconBell size={20} color="#64748b" />
                      <Title order={4}>Otros comunicados</Title>
                    </Group>
                  )}
                  <Stack gap="md">
                    {comunicadosNormales.map((comunicado) => {
                      const tipoInfo = getTipoInfo(comunicado.tipo)
                      const TipoIcon = tipoInfo.icon

                      return (
                        <Card
                          key={comunicado.id}
                          p="lg"
                          radius="xl"
                          withBorder
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedComunicado(comunicado)}
                        >
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                              {comunicado.imagen_url ? (
                                <Image
                                  src={comunicado.imagen_url}
                                  width={80}
                                  height={80}
                                  radius="lg"
                                  fit="cover"
                                />
                              ) : (
                                <ThemeIcon
                                  size={60}
                                  radius="xl"
                                  color={tipoInfo.color}
                                >
                                  <TipoIcon size={28} color="white" />
                                </ThemeIcon>
                              )}
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Group gap="xs" mb={4}>
                                  <Badge size="sm" color={tipoInfo.color}>{tipoInfo.label}</Badge>
                                </Group>
                                <Text fw={700} size="md" lineClamp={1}>
                                  {comunicado.titulo}
                                </Text>
                                <Text size="sm" c="dimmed" lineClamp={2} mt={4}>
                                  {comunicado.contenido}
                                </Text>
                              </Box>
                            </Group>
                            <Box ta="right" visibleFrom="sm">
                              <Text size="xs" c="dimmed" mb="xs">
                                {formatFechaCorta(comunicado.fecha_publicacion || comunicado.created_at)}
                              </Text>
                              <ActionIcon variant="light" color={tipoInfo.color} radius="xl">
                                <IconChevronRight size={18} />
                              </ActionIcon>
                            </Box>
                          </Group>
                        </Card>
                      )
                    })}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Container>

        {/* Modal de detalle */}
        <Modal
          opened={!!selectedComunicado}
          onClose={() => setSelectedComunicado(null)}
          size="lg"
          radius="xl"
          centered
          padding={0}
          withCloseButton={false}
          zIndex={1000}
        >
          {selectedComunicado && (() => {
            const tipoInfo = getTipoInfo(selectedComunicado.tipo)
            const TipoIcon = tipoInfo.icon

            return (
              <Box>
                {/* Header con imagen o gradiente */}
                {selectedComunicado.imagen_url ? (
                  <Box style={{ position: 'relative' }}>
                    <Image
                      src={selectedComunicado.imagen_url}
                      height={250}
                      fit="cover"
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8))',
                      }}
                    />
                    <Box style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                      <Badge color={tipoInfo.color} size="lg" mb="xs">{tipoInfo.label}</Badge>
                      <Title order={2} c="white">{selectedComunicado.titulo}</Title>
                    </Box>
                    <ActionIcon
                      variant="white"
                      color="dark"
                      radius="xl"
                      size="lg"
                      style={{ position: 'absolute', top: 16, right: 16 }}
                      onClick={() => setSelectedComunicado(null)}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Box>
                ) : (
                  <Box
                    p="xl"
                    style={{
                      background: `linear-gradient(135deg, var(--mantine-color-${tipoInfo.color}-6) 0%, var(--mantine-color-${tipoInfo.color}-8) 100%)`,
                      position: 'relative',
                    }}
                  >
                    <ActionIcon
                      variant="filled"
                      color="dark"
                      radius="xl"
                      size="lg"
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(255,255,255,0.2)',
                      }}
                      onClick={() => setSelectedComunicado(null)}
                    >
                      <IconX size={18} color="white" />
                    </ActionIcon>
                    <Group gap="md" mb="md">
                      <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <TipoIcon size={26} color="white" />
                      </ThemeIcon>
                      <Badge variant="white" color="dark" size="lg">{tipoInfo.label}</Badge>
                      {selectedComunicado.destacado && (
                        <Badge variant="white" color="orange" size="lg" leftSection={<IconStar size={12} />}>
                          Destacado
                        </Badge>
                      )}
                    </Group>
                    <Title order={2} c="white">{selectedComunicado.titulo}</Title>
                  </Box>
                )}

                {/* Contenido */}
                <Box p="xl">
                  <Group gap="lg" mb="lg">
                    <Group gap="xs">
                      <IconClock size={16} color="#64748b" />
                      <Text size="sm" c="dimmed">
                        {formatFecha(selectedComunicado.fecha_publicacion || selectedComunicado.created_at)}
                      </Text>
                    </Group>
                  </Group>

                  <Paper p="lg" radius="lg" style={{ background: '#f8fafc' }}>
                    <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {selectedComunicado.contenido}
                    </Text>
                  </Paper>

                  <Button
                    fullWidth
                    mt="xl"
                    variant="light"
                    color="gray"
                    radius="lg"
                    size="md"
                    onClick={() => setSelectedComunicado(null)}
                  >
                    Cerrar
                  </Button>
                </Box>
              </Box>
            )
          })()}
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(ComunicadosCiudadanoPage, { allowedRoles: ['ciudadano'] })