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
  Checkbox,
  Alert,
  Progress
} from '@mantine/core'
import { motion } from 'framer-motion'
import { 
  IconMapPin, 
  IconMail, 
  IconLock, 
  IconUser, 
  IconId, 
  IconPhone,
  IconArrowLeft,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react'
import { registerCitizen, isSupabaseConfigured } from '@/lib/supabase'

// Validador de fortaleza de contraseña
const getPasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25
  return strength
}

const getPasswordColor = (strength) => {
  if (strength < 50) return 'red'
  if (strength < 75) return 'yellow'
  return 'green'
}

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    dni: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordStrength = getPasswordStrength(formData.password)

  const handleChange = (field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value ?? e
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (formData.fullName.trim().length < 3) {
      setError('Ingresa tu nombre completo')
      return false
    }
    if (!/^\d{8}$/.test(formData.dni)) {
      setError('El DNI debe tener 8 dígitos')
      return false
    }
    if (formData.phone && !/^\d{9}$/.test(formData.phone)) {
      setError('El teléfono debe tener 9 dígitos')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Ingresa un email válido')
      return false
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return

    // Verificar si Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError('Base de datos no configurada. Contacta al administrador.')
      return
    }

    setLoading(true)

    try {
      await registerCitizen({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dni: formData.dni,
        phone: formData.phone || null,
      })
      
      setSuccess(true)
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err) {
      console.error('Error de registro:', err)
      if (err.message.includes('already registered')) {
        setError('Este email ya está registrado. ¿Deseas iniciar sesión?')
      } else {
        setError(err.message || 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Registro Exitoso - Willay Map</title>
        </Head>
        <Box
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper radius="xl" p="xl" shadow="xl" style={{ textAlign: 'center', maxWidth: 400 }}>
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <IconCheck size={40} color="white" />
              </Box>
              <Title order={2} mb="md">¡Registro Exitoso!</Title>
              <Text c="dimmed" mb="lg">
                Hemos enviado un email de confirmación a <strong>{formData.email}</strong>.
                Por favor verifica tu bandeja de entrada.
              </Text>
              <Text size="sm" c="dimmed">
                Redirigiendo al login en 3 segundos...
              </Text>
            </Paper>
          </motion.div>
        </Box>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Registrarse - Willay Map</title>
        <meta name="description" content="Crea tu cuenta de ciudadano en Willay Map" />
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
              Crear cuenta
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="xl">
              Únete como ciudadano y mejora tu ciudad
            </Text>

            {error && (
              <Alert icon={<IconAlertCircle size={18} />} color="red" mb="md" radius="md">
                {error}
                {error.includes('iniciar sesión') && (
                  <Anchor component={Link} href="/login" ml="xs" fw={600}>
                    Ir al login
                  </Anchor>
                )}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Nombre completo"
                  placeholder="Juan Pérez García"
                  leftSection={<IconUser size={18} />}
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  required
                  size="md"
                  radius="md"
                />

                <TextInput
                  label="DNI"
                  placeholder="12345678"
                  leftSection={<IconId size={18} />}
                  value={formData.dni}
                  onChange={handleChange('dni')}
                  required
                  size="md"
                  radius="md"
                  maxLength={8}
                  description="Tu DNI se almacena de forma segura (encriptado)"
                />

                <TextInput
                  label="Teléfono (opcional)"
                  placeholder="987654321"
                  leftSection={<IconPhone size={18} />}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  size="md"
                  radius="md"
                  maxLength={9}
                />

                <TextInput
                  label="Correo electrónico"
                  placeholder="tu@email.com"
                  leftSection={<IconMail size={18} />}
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  size="md"
                  radius="md"
                  type="email"
                />

                <div>
                  <PasswordInput
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    leftSection={<IconLock size={18} />}
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    size="md"
                    radius="md"
                    minLength={8}
                  />
                  {formData.password && (
                    <Progress
                      value={passwordStrength}
                      color={getPasswordColor(passwordStrength)}
                      size="xs"
                      mt="xs"
                    />
                  )}
                </div>

                <PasswordInput
                  label="Confirmar contraseña"
                  placeholder="Repite tu contraseña"
                  leftSection={<IconLock size={18} />}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  required
                  size="md"
                  radius="md"
                  error={
                    formData.confirmPassword && 
                    formData.password !== formData.confirmPassword && 
                    'Las contraseñas no coinciden'
                  }
                />

                <Checkbox
                  label={
                    <Text size="sm">
                      Acepto los{' '}
                      <Anchor href="#" c="blue">términos de servicio</Anchor>
                      {' '}y la{' '}
                      <Anchor href="#" c="blue">política de privacidad</Anchor>
                    </Text>
                  }
                  checked={formData.acceptTerms}
                  onChange={handleChange('acceptTerms')}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  radius="md"
                  loading={loading}
                  disabled={!formData.acceptTerms}
                  variant="gradient"
                  gradient={{ from: '#3b82f6', to: '#1d4ed8', deg: 135 }}
                  style={{ marginTop: 8 }}
                >
                  Crear cuenta
                </Button>
              </Stack>
            </form>

            <Text c="dimmed" size="sm" ta="center" mt="xl">
              ¿Ya tienes una cuenta?{' '}
              <Anchor component={Link} href="/login" fw={600} c="blue">
                Inicia sesión
              </Anchor>
            </Text>
          </Paper>
        </motion.div>
      </Box>
    </>
  )
}