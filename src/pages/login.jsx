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
  Center,
  ThemeIcon,
  Divider,
  Loader,
} from '@mantine/core'
import { motion } from 'framer-motion'
import { 
  IconMapPin, 
  IconMail, 
  IconLock, 
  IconArrowLeft,
  IconUser,
  IconBuildingCommunity,
  IconAlertCircle,
  IconSparkles,
  IconShieldCheck,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const roleOptions = [
  { value: 'ciudadano', label: 'Ciudadano', icon: IconUser, color: '#3b82f6' },
  { value: 'municipal', label: 'Municipal', icon: IconBuildingCommunity, color: '#10b981' },
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

    try {
      // 1. Autenticar con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // 2. Obtener perfil de tabla USUARIOS (no profiles)
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Error obteniendo perfil:', profileError)
      }

      // 3. Verificar rol (usando 'rol' no 'role')
      const userRol = profile?.rol || 'ciudadano'

      // Si seleccionó municipal pero no tiene ese rol
      if (selectedRole === 'municipal' && userRol !== 'municipal' && userRol !== 'admin') {
        setError(`Tu cuenta no tiene permisos de municipal. Tu rol es: ${userRol}`)
        setLoading(false)
        return
      }

      // 4. Redirigir según rol
      if (userRol === 'municipal' || userRol === 'admin') {
        router.push('/municipal/dashboard')
      } else {
        router.push('/ciudadano/dashboard')
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decoraciones de fondo */}
        <Box
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
        >
          {/* Botón volver */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs" mb="lg" style={{ color: '#94a3b8' }}>
              <IconArrowLeft size={18} />
              <Text size="sm">Volver al inicio</Text>
            </Group>
          </Link>

          <Paper
            radius={24}
            p="xl"
            style={{ 
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}
          >
            {/* Logo */}
            <Group justify="center" mb="md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              >
                <Box
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(59,130,246,0.4)',
                  }}
                >
                  <IconMapPin size={36} color="white" />
                </Box>
              </motion.div>
            </Group>

            <Title 
              order={2} 
              ta="center" 
              mb={4} 
              style={{ 
                fontFamily: 'Space Grotesk, sans-serif',
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Bienvenido de nuevo
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="xl">
              Ingresa tus credenciales para continuar
            </Text>

            {/* Selector de rol mejorado */}
            <Box mb="lg">
              <Text size="sm" fw={600} mb="xs" c="dark">Tipo de acceso</Text>
              <SegmentedControl
                value={selectedRole}
                onChange={setSelectedRole}
                fullWidth
                size="md"
                data={roleOptions.map(opt => ({
                  value: opt.value,
                  label: (
                    <Center style={{ gap: 10, padding: '4px 0' }}>
                      <ThemeIcon 
                        size={28} 
                        radius="md" 
                        style={{ 
                          background: selectedRole === opt.value 
                            ? opt.color 
                            : 'transparent',
                          color: selectedRole === opt.value 
                            ? 'white' 
                            : opt.color,
                          border: selectedRole === opt.value 
                            ? 'none' 
                            : `1px solid ${opt.color}40`,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <opt.icon size={16} />
                      </ThemeIcon>
                      <Text fw={500} size="sm">{opt.label}</Text>
                    </Center>
                  )
                }))}
                styles={{
                  root: { 
                    background: '#f1f5f9',
                    borderRadius: 12,
                    padding: 4,
                  },
                  indicator: { 
                    background: 'white', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    borderRadius: 10,
                  },
                  label: {
                    padding: '12px 16px',
                  }
                }}
              />
            </Box>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  icon={<IconAlertCircle size={18} />} 
                  color="red" 
                  mb="md" 
                  radius="lg"
                  styles={{
                    root: { background: '#fef2f2', border: '1px solid #fecaca' }
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Correo electrónico"
                  placeholder="tu@email.com"
                  leftSection={<IconMail size={18} color="#64748b" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="md"
                  radius="lg"
                  type="email"
                  styles={{
                    input: {
                      border: '2px solid #e2e8f0',
                      '&:focus': { borderColor: '#3b82f6' },
                    },
                    label: { fontWeight: 600, marginBottom: 6 }
                  }}
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  leftSection={<IconLock size={18} color="#64748b" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="md"
                  radius="lg"
                  styles={{
                    input: {
                      border: '2px solid #e2e8f0',
                      '&:focus': { borderColor: '#3b82f6' },
                    },
                    label: { fontWeight: 600, marginBottom: 6 }
                  }}
                />

                <Group justify="flex-end">
                  <Anchor href="#" size="sm" c="blue" fw={500}>
                    ¿Olvidaste tu contraseña?
                  </Anchor>
                </Group>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  radius="lg"
                  loading={loading}
                  leftSection={!loading && <IconShieldCheck size={20} />}
                  style={{ 
                    marginTop: 8,
                    background: selectedRole === 'municipal' 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: selectedRole === 'municipal'
                      ? '0 10px 30px rgba(16,185,129,0.3)'
                      : '0 10px 30px rgba(59,130,246,0.3)',
                    height: 52,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </Stack>
            </form>

            <Divider my="xl" label="o" labelPosition="center" />

            {selectedRole === 'ciudadano' ? (
              <Box ta="center">
                <Text c="dimmed" size="sm" mb="xs">
                  ¿No tienes una cuenta?
                </Text>
                <Button
                  component={Link}
                  href="/register"
                  variant="light"
                  color="blue"
                  radius="lg"
                  size="md"
                  fullWidth
                  leftSection={<IconSparkles size={18} />}
                >
                  Crear cuenta gratis
                </Button>
              </Box>
            ) : (
              <Alert
                icon={<IconBuildingCommunity size={18} />}
                color="green"
                radius="lg"
                styles={{
                  root: { background: '#ecfdf5', border: '1px solid #a7f3d0' }
                }}
              >
                <Text size="sm" c="green.8">
                  Las cuentas municipales son creadas por el administrador del sistema.
                </Text>
              </Alert>
            )}
          </Paper>

          {/* Footer */}
          <Text ta="center" size="xs" c="dimmed" mt="xl" style={{ color: '#64748b' }}>
            © 2025 Willay Map. Todos los derechos reservados.
          </Text>
        </motion.div>
      </Box>
    </>
  )
}