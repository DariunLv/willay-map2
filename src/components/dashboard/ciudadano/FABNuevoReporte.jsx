// ============================================================================
// WILLAY MAP - Botón Flotante (FAB) para Nuevo Reporte
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Box, ActionIcon, Tooltip, Menu, Text, Group } from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconPlus,
  IconCamera,
  IconMapPin,
  IconX,
} from '@tabler/icons-react'

const MotionBox = motion(Box)

export default function FABNuevoReporte() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const opciones = [
    {
      icon: IconCamera,
      label: 'Reportar con foto',
      description: 'Toma una foto del problema',
      color: '#3b82f6',
      onClick: () => router.push('/ciudadano/nuevo-reporte?modo=foto'),
    },
    {
      icon: IconMapPin,
      label: 'Reportar en mapa',
      description: 'Selecciona ubicación en el mapa',
      color: '#10b981',
      onClick: () => router.push('/ciudadano/nuevo-reporte?modo=mapa'),
    },
  ]

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      {/* Opciones desplegables */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: 70,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {opciones.map((opcion, index) => (
              <motion.div
                key={opcion.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Tooltip label={opcion.description} position="left">
                  <Box
                    onClick={() => {
                      setIsOpen(false)
                      opcion.onClick()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      background: 'white',
                      borderRadius: 12,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      minWidth: 180,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(-4px)'
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${opcion.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <opcion.icon size={20} color={opcion.color} />
                    </Box>
                    <Text size="sm" fw={600}>{opcion.label}</Text>
                  </Box>
                </Tooltip>
              </motion.div>
            ))}
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Botón principal */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ActionIcon
          size={60}
          radius="xl"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            border: 'none',
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <IconX size={28} color="white" />
            ) : (
              <IconPlus size={28} color="white" />
            )}
          </motion.div>
        </ActionIcon>
      </motion.div>

      {/* Efecto de pulso */}
      {!isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.3)',
            animation: 'pulse-ring 2s infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </Box>
  )
}