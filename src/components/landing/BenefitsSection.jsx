import { Title, Text, Box, SimpleGrid, Paper, ThemeIcon, List } from '@mantine/core'
import { motion } from 'framer-motion'
import { 
  IconUser, 
  IconBuildingCommunity, 
  IconCheck,
  IconMessageCircle,
  IconHistory,
  IconBell,
  IconChartPie,
  IconRoute,
  IconUsers
} from '@tabler/icons-react'

const benefitsData = {
  citizens: {
    icon: IconUser,
    title: 'Para Ciudadanos',
    description: 'Participa activamente en la mejora de tu ciudad',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    benefits: [
      { icon: IconMessageCircle, text: 'Reporta problemas fácilmente con foto y ubicación' },
      { icon: IconHistory, text: 'Historial completo de todos tus reportes' },
      { icon: IconBell, text: 'Notificaciones cuando tu reporte avance' },
      { icon: IconCheck, text: 'Valida la solución con fotos del antes y después' },
    ]
  },
  authorities: {
    icon: IconBuildingCommunity,
    title: 'Para Autoridades',
    description: 'Gestiona eficientemente los recursos municipales',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    benefits: [
      { icon: IconChartPie, text: 'Dashboard con estadísticas en tiempo real' },
      { icon: IconRoute, text: 'Optimización de rutas para cuadrillas' },
      { icon: IconUsers, text: 'Gestión de equipos y asignaciones' },
      { icon: IconCheck, text: 'Priorización automática de incidencias' },
    ]
  }
}

export default function BenefitsSection() {
  return (
    <section
      id="beneficios"
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
            Beneficios
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
            Una plataforma para{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              todos
            </span>
          </Title>
          <Text
            size="lg"
            style={{
              color: '#64748b',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Willay Map beneficia tanto a ciudadanos como a autoridades municipales, creando un puente de comunicación efectivo.
          </Text>
        </motion.div>

        {/* Cards de beneficios */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
          {Object.entries(benefitsData).map(([key, data], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Paper
                p="xl"
                radius="xl"
                style={{
                  height: '100%',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decoración de fondo */}
                <Box
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `${data.color}08`,
                  }}
                />

                {/* Contenido */}
                <Box style={{ position: 'relative', zIndex: 1 }}>
                  {/* Header de la tarjeta */}
                  <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                    <Box
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: data.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <data.icon size={32} color="white" stroke={1.5} />
                    </Box>
                    <div>
                      <Title order={3} style={{ color: '#1e293b', marginBottom: 4 }}>
                        {data.title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {data.description}
                      </Text>
                    </div>
                  </Box>

                  {/* Lista de beneficios */}
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {data.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + idx * 0.1, duration: 0.4 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 16px',
                          background: '#f8fafc',
                          borderRadius: 12,
                        }}
                      >
                        <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: `${data.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <benefit.icon size={18} color={data.color} stroke={1.5} />
                        </Box>
                        <Text size="sm" fw={500} style={{ color: '#475569' }}>
                          {benefit.text}
                        </Text>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </div>
    </section>
  )
}