// ============================================================================
// WILLAY MAP - Página de Perfil del Ciudadano
// ============================================================================

import { useState } from 'react'
import Head from 'next/head'
import {
  Container,
  Paper,
  Title,
  Text,
  Avatar,
  Group,
  Stack,
  Grid,
  TextInput,
  Button,
  FileButton,
  Divider,
  Badge,
  Progress,
  Box,
  ThemeIcon,
  Card,
  SimpleGrid,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { motion } from 'framer-motion'
import {
  IconUser,
  IconMail,
  IconPhone,
  IconId,
  IconMapPin,
  IconCamera,
  IconCheck,
  IconTrophy,
  IconCalendar,
} from '@tabler/icons-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useAuth, withAuth } from '@/contexts/AuthContext'

const MotionCard = motion(Card)

const logrosEjemplo = [
  { id: 1, nombre: 'Ciudadano Activo', descripcion: 'Primer reporte', icono: '🎯', obtenido: true },
  { id: 2, nombre: 'Reportero Vecinal', descripcion: '5 reportes', icono: '📝', obtenido: true },
  { id: 3, nombre: 'Vigilante Urbano', descripcion: '10 reportes', icono: '🔍', obtenido: false },
  { id: 4, nombre: '¡Problema Resuelto!', descripcion: 'Primer resuelto', icono: '✅', obtenido: true },
  { id: 5, nombre: 'Contribuidor', descripcion: '5 resueltos', icono: '🏆', obtenido: false },
  { id: 6, nombre: 'Vecino Participativo', descripcion: 'Asistir evento', icono: '📅', obtenido: false },
]

function PerfilPage() {
  const { profile, updateProfile, uploadAvatar, loading } = useAuth()
  const [avatarLoading, setAvatarLoading] = useState(false)

  const form = useForm({
    initialValues: {
      nombre_completo: profile?.nombre_completo || '',
      telefono: profile?.telefono || '',
      dni: profile?.dni || '',
      direccion: profile?.direccion || '',
    },
  })

  const handleAvatarUpload = async (file) => {
    if (!file) return
    setAvatarLoading(true)
    await uploadAvatar?.(file)
    setAvatarLoading(false)
  }

  const handleSubmit = async (values) => {
    await updateProfile?.(values)
  }

  const stats = {
    puntos: profile?.puntos_ciudadano || 150,
    reportes: profile?.reportes_resueltos || 3,
    nivel: Math.floor((profile?.puntos_ciudadano || 150) / 100) + 1,
    progreso: (profile?.puntos_ciudadano || 150) % 100,
  }

  return (
    <>
      <Head>
        <title>Mi Perfil | Willay Map</title>
      </Head>

      <DashboardLayout user={profile} title="Mi Perfil">
        <Container size="lg" py="md">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="md">
                <Paper p="xl" radius="lg" withBorder ta="center">
                  <Box style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={profile?.avatar_url}
                      size={120}
                      radius={120}
                      color="blue"
                      style={{ border: '4px solid #3b82f6' }}
                    >
                      {profile?.nombre_completo?.charAt(0) || 'U'}
                    </Avatar>
                    <FileButton onChange={handleAvatarUpload} accept="image/*">
                      {(props) => (
                        <Button
                          {...props}
                          variant="filled"
                          size="xs"
                          radius="xl"
                          loading={avatarLoading}
                          style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, padding: 0 }}
                        >
                          <IconCamera size={16} />
                        </Button>
                      )}
                    </FileButton>
                  </Box>
                  <Title order={3} mt="md">{profile?.nombre_completo || 'Usuario'}</Title>
                  <Text c="dimmed" size="sm">{profile?.email}</Text>
                  <Badge mt="sm" size="lg" variant="gradient" gradient={{ from: '#3b82f6', to: '#8b5cf6' }}>
                    Ciudadano Nivel {stats.nivel}
                  </Badge>
                  <Divider my="md" />
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Progreso</Text>
                      <Text size="xs" fw={600}>{stats.progreso}/100 pts</Text>
                    </Group>
                    <Progress value={stats.progreso} size="lg" radius="xl" striped animated />
                  </Box>
                  <Divider my="md" />
                  <SimpleGrid cols={2} spacing="xs">
                    <Paper p="sm" radius="md" bg="#f1f5f9">
                      <Text size="xl" fw={700} c="blue">{stats.puntos}</Text>
                      <Text size="xs" c="dimmed">Puntos</Text>
                    </Paper>
                    <Paper p="sm" radius="md" bg="#f1f5f9">
                      <Text size="xl" fw={700} c="green">{stats.reportes}</Text>
                      <Text size="xs" c="dimmed">Resueltos</Text>
                    </Paper>
                  </SimpleGrid>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="xl">
                <Paper p="xl" radius="lg" withBorder>
                  <Group gap="sm" mb="lg">
                    <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: '#3b82f6', to: '#1d4ed8' }}>
                      <IconUser size={20} />
                    </ThemeIcon>
                    <Title order={4}>Información Personal</Title>
                  </Group>
                  <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                      <TextInput label="Nombre completo" leftSection={<IconUser size={16} />} {...form.getInputProps('nombre_completo')} />
                      <Grid>
                        <Grid.Col span={6}>
                          <TextInput label="Teléfono" leftSection={<IconPhone size={16} />} {...form.getInputProps('telefono')} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput label="DNI" leftSection={<IconId size={16} />} {...form.getInputProps('dni')} disabled={!!profile?.dni} />
                        </Grid.Col>
                      </Grid>
                      <TextInput label="Dirección" leftSection={<IconMapPin size={16} />} {...form.getInputProps('direccion')} />
                      <TextInput label="Correo" value={profile?.email || ''} leftSection={<IconMail size={16} />} disabled />
                      <Group justify="flex-end" mt="md">
                        <Button type="submit" loading={loading} leftSection={<IconCheck size={18} />}>Guardar</Button>
                      </Group>
                    </Stack>
                  </form>
                </Paper>

                <Paper p="xl" radius="lg" withBorder>
                  <Group gap="sm" mb="lg">
                    <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: '#f59e0b', to: '#f97316' }}>
                      <IconTrophy size={20} />
                    </ThemeIcon>
                    <Title order={4}>Mis Logros</Title>
                    <Badge variant="light" color="orange">
                      {logrosEjemplo.filter(l => l.obtenido).length}/{logrosEjemplo.length}
                    </Badge>
                  </Group>
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                    {logrosEjemplo.map((logro, index) => (
                      <MotionCard
                        key={logro.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        padding="md"
                        radius="md"
                        withBorder
                        style={{
                          opacity: logro.obtenido ? 1 : 0.5,
                          filter: logro.obtenido ? 'none' : 'grayscale(100%)',
                          background: logro.obtenido ? '#fefce8' : '#f8fafc',
                        }}
                      >
                        <Stack gap="xs" align="center" ta="center">
                          <Text size="2rem">{logro.icono}</Text>
                          <Text size="sm" fw={600}>{logro.nombre}</Text>
                          <Text size="xs" c="dimmed">{logro.descripcion}</Text>
                          {logro.obtenido && <Badge size="xs" color="green">✓ Obtenido</Badge>}
                        </Stack>
                      </MotionCard>
                    ))}
                  </SimpleGrid>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </DashboardLayout>
    </>
  )
}

export default withAuth(PerfilPage, { allowedRoles: ['ciudadano'] })