// ============================================
// PERFIL DE USUARIO
// Archivo: src/pages/perfil.jsx
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
  TextInput,
  Button,
  Stack,
  Avatar,
  Divider,
  SimpleGrid,
  PasswordInput,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconUser,
  IconMail,
  IconPhone,
  IconId,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconEdit,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

function PerfilPage() {
  const { user, profile, updateProfile } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const form = useForm({
    initialValues: {
      full_name: '',
      telefono: '',
      dni: '',
    },
    validate: {
      full_name: (v) => (v.length < 3 ? 'Mínimo 3 caracteres' : null),
    },
  })

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (v) => (v.length < 8 ? 'Mínimo 8 caracteres' : null),
      confirmPassword: (v, values) => (v !== values.newPassword ? 'Las contraseñas no coinciden' : null),
    },
  })

  useEffect(() => {
    if (profile) {
      form.setValues({
        full_name: profile.full_name || '',
        telefono: profile.telefono || '',
        dni: profile.dni || '',
      })
    }
  }, [profile])

  const guardarPerfil = async (values) => {
    setGuardando(true)
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          full_name: values.full_name,
          telefono: values.telefono,
          dni: values.dni,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      if (updateProfile) {
        await updateProfile(values)
      }

      notifications.show({
        title: 'Perfil actualizado',
        message: 'Tus datos han sido guardados correctamente',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      setEditMode(false)
    } catch (error) {
      console.error('Error:', error)
      notifications.show({
        title: 'Error',
        message: 'No se pudo actualizar el perfil',
        color: 'red',
      })
    } finally {
      setGuardando(false)
    }
  }

  const cambiarPassword = async (values) => {
    setGuardandoPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      })

      if (error) throw error

      notifications.show({
        title: 'Contraseña actualizada',
        message: 'Tu contraseña ha sido cambiada correctamente',
        color: 'green',
      })

      passwordForm.reset()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      })
    } finally {
      setGuardandoPassword(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin': return 'red'
      case 'municipal': return 'green'
      default: return 'blue'
    }
  }

  const getRolLabel = (rol) => {
    switch (rol) {
      case 'admin': return 'Administrador'
      case 'municipal': return 'Municipal'
      default: return 'Ciudadano'
    }
  }

  return (
    <>
      <Head>
        <title>Mi Perfil | Willay Map</title>
      </Head>

      <DashboardLayout user={profile}>
        <Container size="md" py="md">
          {/* Header */}
          <Paper p="xl" radius="lg" mb="lg" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white' }}>
            <Group>
              <Avatar size={80} radius="xl" color="white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Text size="1.5rem" fw={700}>{getInitials(profile?.full_name)}</Text>
              </Avatar>
              <Box>
                <Title order={2}>{profile?.full_name || 'Usuario'}</Title>
                <Text opacity={0.9}>{profile?.email}</Text>
                <Badge size="lg" variant="white" color="dark" mt="xs">
                  {getRolLabel(profile?.rol)}
                </Badge>
              </Box>
            </Group>
          </Paper>

          {/* Información del perfil */}
          <Paper p="lg" radius="lg" withBorder mb="lg">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                  <IconUser size={20} />
                </ThemeIcon>
                <Box>
                  <Text fw={700}>Información Personal</Text>
                  <Text size="sm" c="dimmed">Tus datos de cuenta</Text>
                </Box>
              </Group>
              <Button
                variant={editMode ? 'filled' : 'light'}
                leftSection={<IconEdit size={16} />}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancelar' : 'Editar'}
              </Button>
            </Group>

            <form onSubmit={form.onSubmit(guardarPerfil)}>
              <Stack>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label="Nombre Completo"
                    placeholder="Tu nombre"
                    leftSection={<IconUser size={16} />}
                    disabled={!editMode}
                    {...form.getInputProps('full_name')}
                  />
                  <TextInput
                    label="Email"
                    value={profile?.email || ''}
                    leftSection={<IconMail size={16} />}
                    disabled
                    description="El email no se puede cambiar"
                  />
                  <TextInput
                    label="Teléfono"
                    placeholder="999 999 999"
                    leftSection={<IconPhone size={16} />}
                    disabled={!editMode}
                    {...form.getInputProps('telefono')}
                  />
                  <TextInput
                    label="DNI"
                    placeholder="12345678"
                    leftSection={<IconId size={16} />}
                    disabled={!editMode}
                    {...form.getInputProps('dni')}
                  />
                </SimpleGrid>

                {editMode && (
                  <Button type="submit" loading={guardando} leftSection={<IconCheck size={16} />}>
                    Guardar Cambios
                  </Button>
                )}
              </Stack>
            </form>
          </Paper>

          {/* Cambiar contraseña */}
          <Paper p="lg" radius="lg" withBorder>
            <Group mb="md">
              <ThemeIcon size={40} radius="xl" color="orange" variant="light">
                <IconLock size={20} />
              </ThemeIcon>
              <Box>
                <Text fw={700}>Cambiar Contraseña</Text>
                <Text size="sm" c="dimmed">Actualiza tu contraseña de acceso</Text>
              </Box>
            </Group>

            <Alert icon={<IconAlertCircle size={18} />} color="yellow" mb="md">
              Por seguridad, usa una contraseña de al menos 8 caracteres con letras y números.
            </Alert>

            <form onSubmit={passwordForm.onSubmit(cambiarPassword)}>
              <Stack>
                <PasswordInput
                  label="Nueva Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  leftSection={<IconLock size={16} />}
                  {...passwordForm.getInputProps('newPassword')}
                />
                <PasswordInput
                  label="Confirmar Contraseña"
                  placeholder="Repite la contraseña"
                  leftSection={<IconLock size={16} />}
                  {...passwordForm.getInputProps('confirmPassword')}
                />
                <Button type="submit" loading={guardandoPassword} color="orange">
                  Cambiar Contraseña
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(PerfilPage)
