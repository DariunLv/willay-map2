// ============================================================================
// WILLAY MAP - Mapeo de Iconos
// Archivo: src/lib/iconMap.js
// ============================================================================

import { IconRoadOff, IconBulbOff, IconTrash, IconDroplet, IconAlertTriangle, IconTree, IconBuilding, IconDots } from '@tabler/icons-react'

export const ICON_MAP = {
  'IconRoadOff': IconRoadOff,
  'IconBulbOff': IconBulbOff,
  'IconTrash': IconTrash,
  'IconDroplet': IconDroplet,
  'IconAlertTriangle': IconAlertTriangle,
  'IconTree': IconTree,
  'IconBuilding': IconBuilding,
  'IconDots': IconDots,
}

export function getIconComponent(iconName) {
  if (!iconName) return IconDots
  if (typeof iconName === 'function') return iconName
  return ICON_MAP[iconName] || IconDots
}

export const COLORES_PRIORIDAD = { critica: '#ef4444', alta: '#f59e0b', media: '#3b82f6', baja: '#10b981' }
export const COLORES_ESTADO = { nuevo: '#3b82f6', en_revision: '#06b6d4', asignado: '#8b5cf6', en_proceso: '#f59e0b', resuelto: '#10b981', rechazado: '#ef4444' }

export default ICON_MAP