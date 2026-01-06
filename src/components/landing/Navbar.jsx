import { useState, useEffect } from 'react'
import { Group, Button, Burger, Drawer, Stack, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { motion } from 'framer-motion'
import { IconMapPin, IconLogin, IconUserPlus, IconHome, IconInfoCircle, IconMap, IconHeart } from '@tabler/icons-react'
import Link from 'next/link'

const navLinks = [
  { label: 'Inicio', href: '#inicio', icon: IconHome },
  { label: '¿Cómo funciona?', href: '#como-funciona', icon: IconInfoCircle },
  { label: 'Beneficios', href: '#beneficios', icon: IconHeart },
  { label: 'Mapa público', href: '#mapa', icon: IconMap },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [opened, { toggle, close }] = useDisclosure(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href) => {
    close()
    const element = document.querySelector(href)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} whileHover={{ scale: 1.02 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <IconMapPin size={24} />
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
              Willay<span style={{ color: '#3b82f6' }}>Map</span>
            </span>
          </motion.div>

          <Group gap="xs" visibleFrom="md">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href) }}
                style={{ padding: '8px 16px', borderRadius: 8, color: '#475569', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ backgroundColor: '#f1f5f9', color: '#3b82f6' }}
              >
                <link.icon size={18} />
                {link.label}
              </motion.a>
            ))}
          </Group>

          <Group gap="sm" visibleFrom="md">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Button variant="subtle" color="gray" leftSection={<IconLogin size={18} />} component={Link} href="/login">
                Iniciar sesión
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="gradient" gradient={{ from: '#3b82f6', to: '#1d4ed8', deg: 135 }} leftSection={<IconUserPlus size={18} />} component={Link} href="/register">
                Registrarse
              </Button>
            </motion.div>
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" color="#475569" />
        </div>
      </motion.nav>

      <Drawer opened={opened} onClose={close} size="100%" padding="lg" hiddenFrom="md" zIndex={1001}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <IconMapPin size={24} />
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>
              Willay<span style={{ color: '#3b82f6' }}>Map</span>
            </span>
          </div>
        }
      >
        <Stack gap="lg" mt="xl">
          {navLinks.map((link) => (
            <Button key={link.href} variant="subtle" color="gray" size="lg" justify="flex-start" leftSection={<link.icon size={20} />} onClick={() => scrollToSection(link.href)}>
              {link.label}
            </Button>
          ))}
          <Box mt="xl">
            <Stack gap="sm">
              <Button variant="outline" color="blue" size="lg" leftSection={<IconLogin size={20} />} component={Link} href="/login" fullWidth>
                Iniciar sesión
              </Button>
              <Button variant="gradient" gradient={{ from: '#3b82f6', to: '#1d4ed8', deg: 135 }} size="lg" leftSection={<IconUserPlus size={20} />} component={Link} href="/register" fullWidth>
                Registrarse
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
    </>
  )
}