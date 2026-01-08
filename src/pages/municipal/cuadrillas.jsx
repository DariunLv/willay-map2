// ============================================
// CUADRILLAS MUNICIPAL
// Archivo: src/pages/municipal/cuadrillas.jsx
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
  SimpleGrid,
  Button,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Stack,
  ActionIcon,
  Tooltip,
  Card,
  Avatar,
  Loader,
  Center,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconTruck,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhone,
  IconUsers,
  IconTools,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ESPECIALIDADES = [
  { value: 'baches', label: 'Baches y Pavimento' },
  { value: 'alumbrado', label: 'Alumbrado Público' },
  { value: 'residuos', label: 'Residuos Sólidos' },
  { value: 'agua', label: 'Agua y Alcantarillado' },
  { value: 'areas_verdes', label: 'Áreas Verdes' },
  { value: 'senalizacion', label: 'Señalización' },
  { value: 'general', label: 'General' },
]

const ESTADOS_CUADRILLA = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'ocupada', label: 'Ocupada', color: 'orange' },
  { value: 'inactiva', label: 'Inactiva', color: 'gray' },
]

function CuadrillasMunicipal() {
  const { profile } = useAuth()
  const [cuadrillas, setCuadrillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const form = useForm({
    initialValues: {
      nombre: '',
      tipo_especialidad: '',
      capacidad_diaria: 5,
      contacto: '',
      vehiculo_asignado: '',
      estado: 'disponible',
    },
    validate: {
      nombre: (v) => (v.length < 3 ? 'Mínimo 3 caracteres' : null),
      tipo_especialidad: (v) => (!v ? 'Selecciona una especialidad' : null),
    },
  })

  const cargarCuadrillas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cuadrillas')
        .select('*')
        .order('nombre')

      if (error) throw error
      setCuadrillas(data || [])
    } catch (error) {
      console.error('Error:', error)
      // Si la tabla no existe, mostrar lista vacía
      setCuadrillas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCuadrillas()
  }, [])

  const abrirModal = (cuadrilla = null) => {
    if (cuadrilla) {
      setEditando(cuadrilla)
      form.setValues({
        nombre: cuadrilla.nombre,
        tipo_especialidad: cuadrilla.tipo_especialidad,
        capacidad_diaria: cuadrilla.capacidad_diaria,
        contacto: cuadrilla.contacto || '',
        vehiculo_asignado: cuadrilla.vehiculo_asignado || '',
        estado: cuadrilla.estado,
      })
    } else {
      setEditando(null)
      form.reset()
    }
    setModalOpen(true)
  }

  const guardarCuadrilla = async (values) => {
    setGuardando(true)
    try {
      if (editando) {
        const { error } = await supabase
          .from('cuadrillas')
          .update(values)
          .eq('id', editando.id)

        if (error) throw error
        notifications.show({ title: 'Actualizado', message: 'Cuadrilla actualizada', color: 'green' })
      } else {
        const { error } = await supabase.from('cuadrillas').insert(values)
        if (error) throw error
        notifications.show({ title: 'Creado', message: 'Cuadrilla creada', color: 'green' })
      }

      setModalOpen(false)
      cargarCuadrillas()
    } catch (error) {
      console.error('Error:', error)
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCuadrilla = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cuadrilla?')) return

    try {
      const { error } = await supabase.from('cuadrillas').delete().eq('id', id)
      if (error) throw error
      notifications.show({ title: 'Eliminado', message: 'Cuadrilla eliminada', color: 'green' })
      cargarCuadrillas()
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    }
  }

  return (
    <>
      <Head>
        <title>Cuadrillas | Panel Municipal</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper p="lg" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconTruck size={28} />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Cuadrillas de Campo</Title>
                  <Text opacity={0.9}>Gestión de equipos de trabajo</Text>
                </Box>
              </Group>
              <Button leftSection={<IconPlus size={18} />} variant="white" color="dark" onClick={() => abrirModal()}>
                Nueva Cuadrilla
              </Button>
            </Group>
          </Paper>

          {/* Lista de cuadrillas */}
          {loading ? (
            <Center py="xl"><Loader /></Center>
          ) : cuadrillas.length === 0 ? (
            <Paper p="xl" radius="lg" withBorder ta="center">
              <IconTruck size={48} color="#94a3b8" />
              <Text c="dimmed" mt="md">No hay cuadrillas registradas</Text>
              <Text size="sm" c="dimmed" mb="md">Crea la primera cuadrilla para comenzar</Text>
              <Button onClick={() => abrirModal()}>Crear Cuadrilla</Button>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {cuadrillas.map((cuadrilla) => {
                const especialidad = ESPECIALIDADES.find(e => e.value === cuadrilla.tipo_especialidad)
                const estadoInfo = ESTADOS_CUADRILLA.find(e => e.value === cuadrilla.estado)

                return (
                  <Card key={cuadrilla.id} radius="lg" withBorder padding="lg">
                    <Group justify="space-between" mb="md">
                      <Group>
                        <Avatar size={50} radius="xl" color="orange">
                          <IconTruck size={24} />
                        </Avatar>
                        <Box>
                          <Text fw={700}>{cuadrilla.nombre}</Text>
                          <Badge size="sm" color={estadoInfo?.color}>{estadoInfo?.label}</Badge>
                        </Box>
                      </Group>
                      <Group gap="xs">
                        <Tooltip label="Editar">
                          <ActionIcon variant="light" onClick={() => abrirModal(cuadrilla)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar">
                          <ActionIcon variant="light" color="red" onClick={() => eliminarCuadrilla(cuadrilla.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>

                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconTools size={16} color="#64748b" />
                        <Text size="sm" c="dimmed">{especialidad?.label || cuadrilla.tipo_especialidad}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconUsers size={16} color="#64748b" />
                        <Text size="sm" c="dimmed">Capacidad: {cuadrilla.capacidad_diaria} reportes/día</Text>
                      </Group>
                      {cuadrilla.contacto && (
                        <Group gap="xs">
                          <IconPhone size={16} color="#64748b" />
                          <Text size="sm" c="dimmed">{cuadrilla.contacto}</Text>
                        </Group>
                      )}
                      {cuadrilla.vehiculo_asignado && (
                        <Group gap="xs">
                          <IconTruck size={16} color="#64748b" />
                          <Text size="sm" c="dimmed">{cuadrilla.vehiculo_asignado}</Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                )
              })}
            </SimpleGrid>
          )}
        </Container>

        {/* Modal */}
        <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Cuadrilla' : 'Nueva Cuadrilla'}>
          <form onSubmit={form.onSubmit(guardarCuadrilla)}>
            <Stack>
              <TextInput label="Nombre de la Cuadrilla" placeholder="Ej: Cuadrilla Norte" {...form.getInputProps('nombre')} />
              <Select
                label="Especialidad"
                placeholder="Seleccionar..."
                data={ESPECIALIDADES}
                {...form.getInputProps('tipo_especialidad')}
              />
              <NumberInput label="Capacidad Diaria" description="Reportes que puede atender por día" min={1} max={50} {...form.getInputProps('capacidad_diaria')} />
              <TextInput label="Contacto" placeholder="Teléfono o email" {...form.getInputProps('contacto')} />
              <TextInput label="Vehículo Asignado" placeholder="Ej: Camioneta ABC-123" {...form.getInputProps('vehiculo_asignado')} />
              <Select label="Estado" data={ESTADOS_CUADRILLA} {...form.getInputProps('estado')} />
              <Button type="submit" loading={guardando} color="orange">
                {editando ? 'Actualizar' : 'Crear'} Cuadrilla
              </Button>
            </Stack>
          </form>
        </Modal>
      </DashboardLayout>
    </>
  )
}

export default withAuth(CuadrillasMunicipal, { allowedRoles: ['municipal', 'admin'] })
