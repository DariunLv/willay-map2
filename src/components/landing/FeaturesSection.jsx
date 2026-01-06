import { Title, Text, Card, SimpleGrid, ThemeIcon, Box } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconMapPin, IconClock, IconBell, IconChartBar, IconShield, IconUsers } from '@tabler/icons-react'

const features = [
  {
    icon: IconMapPin,
    title: 'Reportes geolocalizados',
    description: 'Ubica exactamente el problema en el mapa con fotografías y descripción detallada.',
    color: 'blue',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  {
    icon: IconClock,
    title: 'Seguimiento en tiempo real',
    description: 'Observa el estado de tu reporte desde que lo envías hasta su resolución.',
    color: 'green',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    icon: IconBell,
    title: 'Notificaciones automáticas',
    description: 'Recibe alertas cuando tu reporte cambie de estado o sea atendido.',
    color: 'orange',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    icon: IconChartBar,
    title: 'Transparencia y análisis',
    description: 'Visualiza estadísticas públicas de problemas resueltos por zona.',
    color: 'violet',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    icon: IconShield,
    title: 'Privacidad garantizada',
    description: 'Tus datos personales están protegidos y nunca se muestran públicamente.',
    color: 'red',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  {
    icon: IconUsers,
    title: 'Comunidad activa',
    description: 'Únete a miles de ciudadanos que ya mejoran su ciudad día a día.',
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: 'easeOut' } 
  }
}

export default function FeaturesSection() {
  return (
    <section style={{ padding: '100px 0', background: 'white' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <Text
            size="sm"
            fw={600}
            style={{
              color: '#3b82f6',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}
          >
            ¿Qué es Willay Map?
          </Text>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 16,
            }}
          >
            Una plataforma{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              diseñada para ti
            </span>
          </Title>
          <Text
            size="lg"
            style={{
              color: '#64748b',
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Simplificamos la forma en que reportas y das seguimiento a los problemas de tu ciudad.
          </Text>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={30}>
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={cardVariants}>
                <Card
                  padding="xl"
                  style={{
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = '#3b82f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                >
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: feature.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <feature.icon size={28} color="white" stroke={1.5} />
                  </Box>

                  <Text
                    fw={700}
                    size="lg"
                    style={{ color: '#1e293b', marginBottom: 12 }}
                  >
                    {feature.title}
                  </Text>

                  <Text size="sm" style={{ color: '#64748b', lineHeight: 1.7 }}>
                    {feature.description}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </div>
    </section>
  )
}