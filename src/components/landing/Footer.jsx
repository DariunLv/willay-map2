import { Text, Group, Box, Anchor, Stack } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconMapPin, IconBrandGithub, IconMail, IconPhone, IconMapPinFilled } from '@tabler/icons-react'

const footerLinks = {
  platform: {
    title: 'Plataforma',
    links: [
      { label: 'Inicio', href: '#inicio' },
      { label: '¿Cómo funciona?', href: '#como-funciona' },
      { label: 'Mapa público', href: '#mapa' },
      { label: 'Beneficios', href: '#beneficios' },
    ]
  },
  resources: {
    title: 'Recursos',
    links: [
      { label: 'Guía de usuario', href: '#' },
      { label: 'Preguntas frecuentes', href: '#' },
      { label: 'Términos de servicio', href: '#' },
      { label: 'Política de privacidad', href: '#' },
    ]
  },
  contact: {
    title: 'Contacto',
    links: [
      { label: 'soporte@willaymap.pe', href: 'mailto:soporte@willaymap.pe', icon: IconMail },
      { label: '+51 999 999 999', href: 'tel:+51999999999', icon: IconPhone },
      { label: 'Puno, Perú', href: '#', icon: IconMapPinFilled },
    ]
  }
}

export default function Footer() {
  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '80px 0 32px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Grid principal */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 48,
            marginBottom: 64,
          }}
        >
          {/* Logo y descripción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Group gap="sm" mb="md">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconMapPin size={24} color="white" />
              </Box>
              <Text
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                Willay<span style={{ color: '#60a5fa' }}>Map</span>
              </Text>
            </Group>
            <Text
              size="sm"
              style={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: 280 }}
            >
              Sistema de Gestión de Problemas Ciudadanos en Tiempo Real. Mejorando la comunicación entre ciudadanos y autoridades.
            </Text>
            
            {/* Redes sociales */}
            <Group gap="sm" mt="lg">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconBrandGithub size={20} />
              </motion.a>
            </Group>
          </motion.div>

          {/* Links de navegación */}
          {Object.entries(footerLinks).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <Text
                fw={600}
                size="sm"
                style={{
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 20,
                }}
              >
                {section.title}
              </Text>
              <Stack gap="sm">
                {section.links.map((link) => (
                  <Anchor
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault()
                        scrollToSection(link.href)
                      }
                    }}
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {link.icon && <link.icon size={16} />}
                    {link.label}
                  </Anchor>
                ))}
              </Stack>
            </motion.div>
          ))}
        </div>

        {/* Línea divisoria */}
        <Box
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, #334155, transparent)',
            marginBottom: 32,
          }}
        />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Text size="sm" style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} Willay Map. Todos los derechos reservados.
          </Text>
          <Text size="sm" style={{ color: '#64748b' }}>
            Desarrollado con ❤️ en Puno, Perú
          </Text>
        </motion.div>
      </div>
    </footer>
  )
}