import { Title, Text, Button, Group, Box, Badge } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconMapPin, IconArrowRight, IconEye, IconSparkles } from '@tabler/icons-react'
import dynamic from 'next/dynamic'

// Importación dinámica del mapa para evitar SSR
const PublicMap = dynamic(() => import('@/components/map/PublicMap'), { ssr: false })

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

// Puntos de ejemplo para el mapa hero
const samplePoints = [
  { lat: -15.5006, lng: -70.1349, type: 'bache', status: 'pending' },
  { lat: -15.5056, lng: -70.1289, type: 'alumbrado', status: 'inProgress' },
  { lat: -15.4976, lng: -70.1409, type: 'basura', status: 'resolved' },
  { lat: -15.5026, lng: -70.1319, type: 'agua', status: 'pending' },
  { lat: -15.4996, lng: -70.1369, type: 'bache', status: 'inProgress' },
]

export default function HeroSection() {
  return (
    <section
      id="inicio"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #f0f9ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: 'absolute', top: '10%', right: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          style={{
            position: 'absolute', bottom: '20%', left: '5%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          }}
        />
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Contenido izquierdo */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Badge
                size="lg"
                variant="light"
                color="blue"
                leftSection={<IconSparkles size={14} />}
                style={{ marginBottom: 24 }}
              >
                Sistema Municipal de Reportes
              </Badge>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Title
                order={1}
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 24,
                  color: '#0f172a',
                }}
              >
                Reporta y gestiona{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  problemas ciudadanos
                </span>{' '}
                en tiempo real
              </Title>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Text
                size="xl"
                style={{
                  color: '#475569',
                  marginBottom: 32,
                  maxWidth: 540,
                  lineHeight: 1.7,
                }}
              >
                Una plataforma digital que mejora la comunicación entre ciudadanos y autoridades locales para resolver problemas urbanos de manera eficiente.
              </Text>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Group gap="md">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="xl"
                    variant="gradient"
                    gradient={{ from: '#3b82f6', to: '#1d4ed8', deg: 135 }}
                    leftSection={<IconMapPin size={22} />}
                    rightSection={<IconArrowRight size={18} />}
                    style={{ paddingLeft: 28, paddingRight: 28, height: 56 }}
                  >
                    Reportar un problema
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="xl"
                    variant="light"
                    color="blue"
                    leftSection={<IconEye size={22} />}
                    style={{ paddingLeft: 28, paddingRight: 28, height: 56 }}
                    onClick={() => document.querySelector('#mapa')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Ver mapa público
                  </Button>
                </motion.div>
              </Group>
            </motion.div>

            {/* Estadísticas rápidas */}
            <motion.div variants={itemVariants} style={{ marginTop: 48 }}>
              <Group gap={40}>
                {[
                  { value: '2,500+', label: 'Reportes resueltos' },
                  { value: '15', label: 'Distritos activos' },
                  { value: '4.8★', label: 'Satisfacción' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.15 }}
                  >
                    <Text style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1d4ed8', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {stat.value}
                    </Text>
                    <Text size="sm" c="dimmed">{stat.label}</Text>
                  </motion.div>
                ))}
              </Group>
            </motion.div>
          </motion.div>

          {/* Mapa a la derecha */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ position: 'relative' }}
          >
            <Box
              style={{
                height: 500,
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                border: '4px solid white',
              }}
            >
              <PublicMap points={samplePoints} height={500} />
            </Box>

            {/* Tarjeta flotante de notificación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                background: 'white',
                borderRadius: 16,
                padding: '16px 20px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                ✓
              </div>
              <div>
                <Text fw={600} size="sm" c="dark">Bache reparado</Text>
                <Text size="xs" c="dimmed">Av. Circunvalación • Hace 5 min</Text>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Onda decorativa inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}