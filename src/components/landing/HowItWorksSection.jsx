import { Title, Text, Box, Group, Badge } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconUserPlus, IconMapPin, IconEye, IconCircleCheck } from '@tabler/icons-react'

const steps = [
  {
    number: '01',
    icon: IconUserPlus,
    title: 'Regístrate',
    description: 'Crea tu cuenta con tu DNI y correo electrónico. Es rápido, gratuito y seguro.',
    color: '#3b82f6',
  },
  {
    number: '02',
    icon: IconMapPin,
    title: 'Reporta el problema',
    description: 'Toma una foto, selecciona la ubicación en el mapa y describe brevemente el problema.',
    color: '#10b981',
  },
  {
    number: '03',
    icon: IconEye,
    title: 'Sigue el estado',
    description: 'Recibe notificaciones y observa en tiempo real cómo avanza la atención de tu reporte.',
    color: '#f59e0b',
  },
  {
    number: '04',
    icon: IconCircleCheck,
    title: 'Problema resuelto',
    description: 'La cuadrilla atiende el problema y te notificamos cuando esté solucionado.',
    color: '#8b5cf6',
  },
]

export default function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <Badge size="lg" variant="light" color="blue" mb="md">
            Proceso simple
          </Badge>
          <Title
            order={2}
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: 16,
            }}
          >
            ¿Cómo funciona?
          </Title>
          <Text
            size="lg"
            style={{
              color: '#64748b',
              maxWidth: 500,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            En solo 4 pasos puedes reportar cualquier problema urbano y seguir su resolución.
          </Text>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Línea conectora */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 4,
              background: 'linear-gradient(180deg, #3b82f6 0%, #10b981 33%, #f59e0b 66%, #8b5cf6 100%)',
              borderRadius: 4,
              transform: 'translateX(-50%)',
              display: 'none',
            }}
            className="timeline-line"
          />

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                    alignItems: 'center',
                    gap: 40,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Tarjeta de contenido */}
                  <Box
                    style={{
                      flex: '1 1 300px',
                      maxWidth: 400,
                      background: 'white',
                      borderRadius: 20,
                      padding: 32,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #e2e8f0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Número de paso decorativo */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        fontSize: '120px',
                        fontWeight: 800,
                        color: step.color,
                        opacity: 0.05,
                        fontFamily: 'Space Grotesk, sans-serif',
                        lineHeight: 1,
                      }}
                    >
                      {step.number}
                    </div>

                    <Group align="flex-start" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                      <Box
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}10 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <step.icon size={28} color={step.color} stroke={1.5} />
                      </Box>

                      <div>
                        <Text
                          size="xs"
                          fw={700}
                          style={{
                            color: step.color,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: 4,
                          }}
                        >
                          Paso {step.number}
                        </Text>
                        <Text fw={700} size="xl" style={{ color: '#1e293b', marginBottom: 8 }}>
                          {step.title}
                        </Text>
                        <Text size="sm" style={{ color: '#64748b', lineHeight: 1.7 }}>
                          {step.description}
                        </Text>
                      </div>
                    </Group>
                  </Box>

                  {/* Círculo indicador */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      fontFamily: 'Space Grotesk, sans-serif',
                      boxShadow: `0 8px 24px ${step.color}40`,
                      flexShrink: 0,
                    }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Espacio vacío para balance */}
                  <div style={{ flex: '1 1 300px', maxWidth: 400 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}