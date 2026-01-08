// ============================================
// USUARIOS MUNICIPAL
// Archivo: src/pages/municipal/usuarios.jsx
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
  Table,
  TextInput,
  Select,
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  Stack,
  Avatar,
  Loader,
  Center,
  Pagination,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconUsers,
  IconSearch,
  IconShield,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const ROLES = [
  { value: 'ciudadano', label: 'Ciudadano', color: 'blue' },
  { value: 'municipal', label: 'Municipal', color: 'green' },
  { value: 'admin', label: 'Administrador', color: 'red' },
]

const ITEMS_PER_PAGE = 10

function UsuariosMunicipal() {
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [page, setPage] = useState(1)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [nuevoRol, setNuevoRol] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargarUsuarios = async () => {
    setLoading(true)
    try {
      let query = supabase.from('usuarios').select('*').order('created_at', { ascending: false })

      if (filtroRol) query = query.eq('rol', filtroRol)

      const { data, error } = await query
      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [filtroRol])

  // Filtrar por búsqueda
  const usuariosFiltrados = usuarios.filter(u => {
    if (!busqueda) return true
    const texto = busqueda.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(texto) ||
      u.email?.toLowerCase().includes(texto) ||
      u.dni?.toLowerCase().includes(texto)
    )
  })

  // Paginación
  const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE)
  const usuariosPaginados = usuariosFiltrados.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  // Editar rol
  const editarUsuario = (usuario) => {
    setSelectedUser(usuario)
    setNuevoRol(usuario.rol)
    setModalOpen(true)
  }

  const guardarCambios = async () => {
    if (!selectedUser || nuevoRol === selectedUser.rol) return

    setGuardando(true)
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ rol: nuevoRol })
        .eq('id', selectedUser.id)

      if (error) throw error

      notifications.show({ title: 'Actualizado', message: 'Rol de usuario actualizado', color: 'green' })
      setModalOpen(false)
      cargarUsuarios()
    } catch (error) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' })
    } finally {
      setGuardando(false)
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Estadísticas
  const stats = {
    total: usuarios.length,
    ciudadanos: usuarios.filter(u => u.rol === 'ciudadano').length,
    municipales: usuarios.filter(u => u.rol === 'municipal').length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
  }

  return (
    <>
      <Head>
        <title>Usuarios | Panel Municipal</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="xl" py="md">
          {/* Header */}
          <Paper p="lg" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', color: 'white' }}>
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={50} radius="xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconUsers size={28} />
                </ThemeIcon>
                <Box>
                  <Title order={2}>Gestión de Usuarios</Title>
                  <Text opacity={0.9}>Administración de usuarios del sistema</Text>
                </Box>
              </Group>
              <Group>
                <Badge size="lg" variant="white" color="dark">{stats.total} usuarios</Badge>
              </Group>
            </Group>
          </Paper>

          {/* Estadísticas rápidas */}
          <Group mb="lg" grow>
            {[
              { label: 'Ciudadanos', value: stats.ciudadanos, color: 'blue' },
              { label: 'Municipales', value: stats.municipales, color: 'green' },
              { label: 'Administradores', value: stats.admins, color: 'red' },
            ].map((item) => (
              <Paper key={item.label} p="md" radius="lg" withBorder>
                <Group>
                  <Badge size="xl" color={item.color} variant="light">{item.value}</Badge>
                  <Text size="sm" c="dimmed">{item.label}</Text>
                </Group>
              </Paper>
            ))}
          </Group>

          {/* Filtros */}
          <Paper p="md" radius="lg" mb="lg" withBorder>
            <Group>
              <TextInput
                placeholder="Buscar por nombre, email o DNI..."
                leftSection={<IconSearch size={16} />}
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filtrar por rol"
                clearable
                value={filtroRol}
                onChange={(v) => { setFiltroRol(v); setPage(1) }}
                data={ROLES}
                style={{ width: 200 }}
              />
              <Button variant="light" onClick={cargarUsuarios} loading={loading}>
                Actualizar
              </Button>
            </Group>
          </Paper>

          {/* Tabla */}
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            {loading ? (
              <Center py="xl"><Loader /></Center>
            ) : usuariosPaginados.length === 0 ? (
              <Center py="xl">
                <Box ta="center">
                  <IconUsers size={48} color="#94a3b8" />
                  <Text c="dimmed" mt="md">No se encontraron usuarios</Text>
                </Box>
              </Center>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Usuario</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>DNI</Table.Th>
                    <Table.Th>Teléfono</Table.Th>
                    <Table.Th>Rol</Table.Th>
                    <Table.Th>Registro</Table.Th>
                    <Table.Th>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {usuariosPaginados.map((usuario) => {
                    const rolInfo = ROLES.find(r => r.value === usuario.rol)
                    return (
                      <Table.Tr key={usuario.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size={36} radius="xl" color={rolInfo?.color}>
                              {getInitials(usuario.full_name)}
                            </Avatar>
                            <Text size="sm" fw={500}>{usuario.full_name || 'Sin nombre'}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">{usuario.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{usuario.dni || '-'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{usuario.telefono || '-'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={rolInfo?.color}>{rolInfo?.label}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{formatFecha(usuario.created_at)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Cambiar rol">
                            <ActionIcon variant="light" onClick={() => editarUsuario(usuario)}>
                              <IconShield size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            )}

            {totalPages > 1 && (
              <Group justify="center" py="md">
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Group>
            )}
          </Paper>
        </Container>

        {/* Modal */}
        <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Cambiar Rol de Usuario" centered zIndex={1000}>
          {selectedUser && (
            <Stack>
              <Group>
                <Avatar size={50} radius="xl" color="blue">
                  {getInitials(selectedUser.full_name)}
                </Avatar>
                <Box>
                  <Text fw={600}>{selectedUser.full_name}</Text>
                  <Text size="sm" c="dimmed">{selectedUser.email}</Text>
                </Box>
              </Group>
              <Select
                label="Rol del Usuario"
                value={nuevoRol}
                onChange={setNuevoRol}
                data={ROLES}
              />
              <Button onClick={guardarCambios} loading={guardando} color="blue">
                Guardar Cambios
              </Button>
            </Stack>
          )}
        </Modal>
      </DashboardLayout>
    </>
  )
}

// CORREGIDO: Ahora permite 'municipal' y 'admin'
export default withAuth(UsuariosMunicipal, { allowedRoles: ['municipal', 'admin'] })
