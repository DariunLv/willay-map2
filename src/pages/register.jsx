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
  Progress,
  ThemeIcon,
  Stepper,
  Divider,
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IconMapPin, 
  IconMail, 
  IconLock, 
  IconUser, 
  IconId, 
  IconPhone,
  IconArrowLeft,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
  IconSparkles,
  IconShieldCheck,
  IconUserPlus,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

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

const getPasswordLabel = (strength) => {
  if (strength < 50) return 'Débil'
  if (strength < 75) return 'Media'
  return 'Fuerte'
}

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(0)
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

  const validateStep = (currentStep) => {
    if (currentStep === 0) {
      if (formData.fullName.trim().length < 3) {
        setError('Ingresa tu nombre completo')
        return false
      }
      if (!/^\d{8}$/.test(formData.dni)) {
        setError('El DNI debe tener 8 dígitos')
        return false
      }
    }
    if (currentStep === 1) {
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
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setError('')
      setStep((s) => Math.min(s + 1, 2))
    }
  }

  const prevStep = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName }
        }
      })

      if (authError) throw authError

      // 2. Crear perfil en tabla USUARIOS (no profiles)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            telefono: formData.phone || null,
            dni: formData.dni || null,
            rol: 'ciudadano',  // CORREGIDO: era 'role'
          })

        if (profileError) {
          console.error('Error creando perfil:', profileError)
          // No lanzar error, el usuario ya se creó en auth
        }
      }
      
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

  // Pantalla de éxito
  if (success) {
    return (
      <>
        <Head>
          <title>Registro Exitoso - Willay Map</title>
        </Head>
        <Box
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
            <Paper 
              radius={24} 
              p="xl" 
              style={{ 
                textAlign: 'center', 
                maxWidth: 420,
                background: 'rgba(255,255,255,0.95)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              >
                <Box
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 15px 40px rgba(16,185,129,0.3)',
                  }}
                >
                  <IconCheck size={50} color="white" stroke={3} />
                </Box>
              </motion.div>

              <Title order={2} mb="md" style={{ fontFamily: 'Space Grotesk' }}>
                ¡Registro Exitoso!
              </Title>
              <Text c="dimmed" mb="lg" size="md">
                Tu cuenta ha sido creada correctamente.
              </Text>
              
              <Paper p="md" radius="lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <Text size="sm" c="green.8">
                  Serás redirigido al login en unos segundos...
                </Text>
              </Paper>

              <Button
                component={Link}
                href="/login"
                fullWidth
                mt="xl"
                size="lg"
                radius="lg"
                variant="gradient"
                gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
              >
                Ir a iniciar sesión
              </Button>
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
            top: '20%',
            right: '5%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
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
            {/* Logo y título */}
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
                  <IconUserPlus size={36} color="white" />
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
              Crear cuenta
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="xl">
              Únete como ciudadano y mejora tu ciudad
            </Text>

            {/* Stepper */}
            <Stepper 
              active={step} 
              size="sm" 
              mb="xl"
              styles={{
                step: { padding: 0 },
                stepIcon: { borderWidth: 2 },
                separator: { marginLeft: 2, marginRight: 2 },
              }}
            >
              <Stepper.Step icon={<IconUser size={16} />} label="Datos" />
              <Stepper.Step icon={<IconLock size={16} />} label="Cuenta" />
              <Stepper.Step icon={<IconCheck size={16} />} label="Confirmar" />
            </Stepper>

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
                  {error.includes('iniciar sesión') && (
                    <Anchor component={Link} href="/login" ml="xs" fw={600}>
                      Ir al login
                    </Anchor>
                  )}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* PASO 1: Datos personales */}
                {step === 0 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Stack gap="md">
                      <TextInput
                        label="Nombre completo"
                        placeholder="Juan Pérez García"
                        leftSection={<IconUser size={18} color="#64748b" />}
                        value={formData.fullName}
                        onChange={handleChange('fullName')}
                        required
                        size="md"
                        radius="lg"
                        styles={{
                          input: { border: '2px solid #e2e8f0' },
                          label: { fontWeight: 600, marginBottom: 6 }
                        }}
                      />

                      <TextInput
                        label="DNI"
                        placeholder="12345678"
                        leftSection={<IconId size={18} color="#64748b" />}
                        value={formData.dni}
                        onChange={handleChange('dni')}
                        required
                        size="md"
                        radius="lg"
                        maxLength={8}
                        description="Tu DNI se almacena de forma segura"
                        styles={{
                          input: { border: '2px solid #e2e8f0' },
                          label: { fontWeight: 600, marginBottom: 6 }
                        }}
                      />

                      <TextInput
                        label="Teléfono (opcional)"
                        placeholder="987654321"
                        leftSection={<IconPhone size={18} color="#64748b" />}
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        size="md"
                        radius="lg"
                        maxLength={9}
                        styles={{
                          input: { border: '2px solid #e2e8f0' },
                          label: { fontWeight: 600, marginBottom: 6 }
                        }}
                      />
                    </Stack>
                  </motion.div>
                )}

                {/* PASO 2: Credenciales */}
                {step === 1 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Stack gap="md">
                      <TextInput
                        label="Correo electrónico"
                        placeholder="tu@email.com"
                        leftSection={<IconMail size={18} color="#64748b" />}
                        value={formData.email}
                        onChange={handleChange('email')}
                        required
                        size="md"
                        radius="lg"
                        type="email"
                        styles={{
                          input: { border: '2px solid #e2e8f0' },
                          label: { fontWeight: 600, marginBottom: 6 }
                        }}
                      />

                      <Box>
                        <PasswordInput
                          label="Contraseña"
                          placeholder="Mínimo 8 caracteres"
                          leftSection={<IconLock size={18} color="#64748b" />}
                          value={formData.password}
                          onChange={handleChange('password')}
                          required
                          size="md"
                          radius="lg"
                          minLength={8}
                          styles={{
                            input: { border: '2px solid #e2e8f0' },
                            label: { fontWeight: 600, marginBottom: 6 }
                          }}
                        />
                        {formData.password && (
                          <Box mt="xs">
                            <Group justify="space-between" mb={4}>
                              <Text size="xs" c="dimmed">Fortaleza:</Text>
                              <Text size="xs" c={getPasswordColor(passwordStrength)} fw={600}>
                                {getPasswordLabel(passwordStrength)}
                              </Text>
                            </Group>
                            <Progress
                              value={passwordStrength}
                              color={getPasswordColor(passwordStrength)}
                              size="sm"
                              radius="xl"
                            />
                          </Box>
                        )}
                      </Box>

                      <PasswordInput
                        label="Confirmar contraseña"
                        placeholder="Repite tu contraseña"
                        leftSection={<IconLock size={18} color="#64748b" />}
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        required
                        size="md"
                        radius="lg"
                        error={
                          formData.confirmPassword && 
                          formData.password !== formData.confirmPassword && 
                          'Las contraseñas no coinciden'
                        }
                        styles={{
                          input: { border: '2px solid #e2e8f0' },
                          label: { fontWeight: 600, marginBottom: 6 }
                        }}
                      />
                    </Stack>
                  </motion.div>
                )}

                {/* PASO 3: Confirmación */}
                {step === 2 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Stack gap="md">
                      {/* Resumen */}
                      <Paper p="md" radius="lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Text size="sm" fw={600} mb="sm" c="dark">Resumen de tu cuenta</Text>
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">Nombre:</Text>
                            <Text size="sm" fw={500}>{formData.fullName}</Text>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">DNI:</Text>
                            <Text size="sm" fw={500}>{formData.dni}</Text>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">Email:</Text>
                            <Text size="sm" fw={500}>{formData.email}</Text>
                          </Group>
                          {formData.phone && (
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">Teléfono:</Text>
                              <Text size="sm" fw={500}>{formData.phone}</Text>
                            </Group>
                          )}
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">Tipo de cuenta:</Text>
                            <Text size="sm" fw={500} c="blue">Ciudadano</Text>
                          </Group>
                        </Stack>
                      </Paper>

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
                        styles={{
                          input: { cursor: 'pointer' },
                          label: { cursor: 'pointer' }
                        }}
                      />
                    </Stack>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botones de navegación */}
              <Group justify="space-between" mt="xl">
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={18} />}
                  onClick={prevStep}
                  disabled={step === 0}
                  radius="lg"
                >
                  Anterior
                </Button>

                {step < 2 ? (
                  <Button
                    rightSection={<IconArrowRight size={18} />}
                    onClick={nextStep}
                    radius="lg"
                    variant="gradient"
                    gradient={{ from: '#3b82f6', to: '#1d4ed8' }}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!formData.acceptTerms}
                    radius="lg"
                    size="md"
                    leftSection={!loading && <IconShieldCheck size={18} />}
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
                    }}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                )}
              </Group>
            </form>

            <Divider my="xl" label="o" labelPosition="center" />

            <Text c="dimmed" size="sm" ta="center">
              ¿Ya tienes una cuenta?{' '}
              <Anchor component={Link} href="/login" fw={600} c="blue">
                Inicia sesión
              </Anchor>
            </Text>
          </Paper>

          {/* Footer */}
          <Text ta="center" size="xs" mt="xl" style={{ color: '#64748b' }}>
            © 2025 Willay Map. Todos los derechos reservados.
          </Text>
        </motion.div>
      </Box>
    </>
  )
}