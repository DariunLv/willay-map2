// ============================================================================
// WILLAY MAP - Cliente de Supabase
// Configuración y exportación del cliente
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de Supabase no configuradas. Revisa tu archivo .env.local')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Exportar tipos de tablas (para autocompletado)
export const TABLES = {
  PROFILES: 'profiles',
  REPORTES: 'reportes',
  HISTORIAL_ESTADOS: 'historial_estados',
  CUADRILLAS: 'cuadrillas',
  MIEMBROS_CUADRILLA: 'miembros_cuadrilla',
  VOTOS_APOYO: 'votos_apoyo',
  RUTAS_OPTIMIZADAS: 'rutas_optimizadas',
  EVENTOS: 'eventos',
  RECORDATORIOS_EVENTOS: 'recordatorios_eventos',
  LIKES_EVENTOS: 'likes_eventos',
  ALERTAS: 'alertas',
  NOTIFICACIONES: 'notificaciones',
  LOGROS: 'logros',
  LOGROS_USUARIOS: 'logros_usuarios',
}

// Buckets de storage
export const STORAGE_BUCKETS = {
  REPORTES_FOTOS: 'reportes-fotos',
  RESOLUCIONES_FOTOS: 'resoluciones-fotos',
  AVATARES: 'avatares',
  EVENTOS_IMAGENES: 'eventos-imagenes',
}

// Categorías de reportes
export const CATEGORIAS_REPORTE = {
  bache: { label: 'Baches', emoji: '🕳️', color: '#6b7280' },
  alumbrado: { label: 'Alumbrado Público', emoji: '💡', color: '#f59e0b' },
  basura: { label: 'Residuos Sólidos', emoji: '🗑️', color: '#84cc16' },
  agua_alcantarillado: { label: 'Agua/Alcantarillado', emoji: '💧', color: '#3b82f6' },
  senalizacion: { label: 'Señalización', emoji: '🚧', color: '#ef4444' },
  areas_verdes: { label: 'Áreas Verdes', emoji: '🌳', color: '#22c55e' },
  infraestructura: { label: 'Infraestructura', emoji: '🏗️', color: '#8b5cf6' },
  otros: { label: 'Otros', emoji: '📋', color: '#64748b' },
}

// Estados de reporte
export const ESTADOS_REPORTE = {
  nuevo: { label: 'Nuevo', color: '#3b82f6', icon: '📝' },
  en_revision: { label: 'En Revisión', color: '#f59e0b', icon: '👀' },
  asignado: { label: 'Asignado', color: '#8b5cf6', icon: '👷' },
  en_proceso: { label: 'En Proceso', color: '#f97316', icon: '🔧' },
  resuelto: { label: 'Resuelto', color: '#10b981', icon: '✅' },
  rechazado: { label: 'Rechazado', color: '#ef4444', icon: '❌' },
}

// Prioridades
export const PRIORIDADES = {
  critica: { label: 'Crítica', color: '#ef4444' },
  alta: { label: 'Alta', color: '#f97316' },
  media: { label: 'Media', color: '#eab308' },
  baja: { label: 'Baja', color: '#22c55e' },
}

export default supabase