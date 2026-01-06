import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Anchor, 
  Group, 
  Box,
  Stack,
  Alert,
  SegmentedControl,
  Center
} from '@mantine/core'
import { motion } from 'framer-motion'
import { 
  IconMapPin, 
  IconMail, 
  IconLock, 
  IconArrowLeft,
  IconUser,
  IconBuildingCommunity,
  IconTruck,
  IconAlertCircle
} from '@tabler/icons-react'
import { login, getUserProfile, isSupabaseConfigured } from '@/lib/supabase'

const roleOptions = [
  { value: 'ciudadano', label: 'Ciudadano', icon: IconUser },
  { value: 'operador', label: 'Municipal', icon: IconBuildingCommunity },
  { value: 'cuadrilla', label: 'Cuadrilla', icon: IconTruck },
]

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('ciudadano')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verificar si Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError('Base de datos no configurada. Contacta al administrador.')
      setLoading(false)
      return
    }

    try {
      const { user } = await login(email, password)
      
      if (user) {
        // Obtener perfil para verificar rol
        const profile = await getUserProfile(user.id)
        
        if (profile.role !== selectedRole && selectedRole !== 'ciudadano') {
          setError(`Tu cuenta no tiene permisos de ${selectedRole}. Tu rol es: ${profile.role}`)
          setLoading(false)
          return
        }

        // Redirigir según rol
        switch (profile.role) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'operador':
            router.push('/municipio/dashboard')
            break
          case 'cuadrilla':
            router.push('/cuadrilla/tareas')
            break
          default:
            router.push('/ciudadano/dashboard')
        }
      }
    } catch (err) {
      console.error('Error de login:', err)
      if (err.message.includes('Invalid login')) {
        setError('Email o contraseña incorrectos')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Por favor confirma tu email antes de iniciar sesión')
      } else {
        setError(err.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Willay Map</title>
        <meta name="description" content="Inicia sesión en Willay Map" />
      </Head>

      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #f0f9ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          {/* Botón volver */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs" mb="lg" style={{ color: '#64748b' }}>
              <IconArrowLeft size={18} />
              <Text size="sm">Volver al inicio</Text>
            </Group>
          </Link>

          <Paper
            radius="xl"
            p="xl"
            shadow="xl"
            style={{ border: '1px solid #e2e8f0' }}
          >
            {/* Logo */}
            <Group justify="center" mb="lg">
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconMapPin size={28} color="white" />
              </Box>
            </Group>

            <Title order={2} ta="center" mb="xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Bienvenido de nuevo
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="xl">
              Selecciona tu tipo de acceso e ingresa tus credenciales
            </Text>

            {/* Selector de rol */}
            <Box mb="lg">
              <Text size="sm" fw={500} mb="xs">Tipo de usuario</Text>
              <SegmentedControl
                value={selectedRole}
                onChange={setSelectedRole}
                fullWidth
                data={roleOptions.map(opt => ({
                  value: opt.value,
                  label: (
                    <Center style={{ gap: 8 }}>
                      <opt.icon size={16} />
                      <span>{opt.label}</span>
                    </Center>
                  )
                }))}
                styles={{
                  root: { background: '#f1f5f9' },
                  indicator: { background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                }}
              />
            </Box>

            {error && (
              <Alert icon={<IconAlertCircle size={18} />} color="red" mb="md" radius="md">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Correo electrónico"
                  placeholder={selectedRole === 'ciudadano' ? 'tu@email.com' : 'usuario@municipio.gob.pe'}
                  leftSection={<IconMail size={18} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="md"
                  radius="md"
                  type="email"
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  leftSection={<IconLock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="md"
                  radius="md"
                />

                <Group justify="flex-end">
                  <Anchor href="#" size="sm" c="blue">
                    ¿Olvidaste tu contraseña?
                  </Anchor>
                </Group>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  radius="md"
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: '#3b82f6', to: '#1d4ed8', deg: 135 }}
                  style={{ marginTop: 8 }}
                >
                  Iniciar sesión
                </Button>
              </Stack>
            </form>

            {selectedRole === 'ciudadano' && (
              <Text c="dimmed" size="sm" ta="center" mt="xl">
                ¿No tienes una cuenta?{' '}
                <Anchor component={Link} href="/register" fw={600} c="blue">
                  Regístrate
                </Anchor>
              </Text>
            )}

            {selectedRole !== 'ciudadano' && (
              <Text c="dimmed" size="xs" ta="center" mt="xl" px="md">
                Las cuentas de personal municipal y cuadrillas son creadas por el administrador del sistema.
              </Text>
            )}
          </Paper>
        </motion.div>
      </Box>
    </>
  )
}