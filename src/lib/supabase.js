import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         !supabaseUrl.includes('placeholder') &&
         !supabaseUrl.includes('tu_url_aqui')
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Registrar ciudadano
export const registerCitizen = async ({ email, password, fullName, dni, phone }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'ciudadano',
      }
    }
  })
  
  if (error) throw error
  
  // Actualizar perfil con DNI hasheado y teléfono
  if (data.user) {
    const dniHash = await hashDNI(dni)
    await supabase
      .from('profiles')
      .update({ dni_hash: dniHash, phone })
      .eq('id', data.user.id)
  }
  
  return data
}

// Login
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// Logout
export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obtener usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Obtener perfil con rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { ...user, profile }
}

// Obtener perfil del usuario
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Hash simple del DNI (para demo - en producción usar bcrypt en el servidor)
const hashDNI = async (dni) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(dni + 'willay_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================
// FUNCIONES DE REPORTES
// ============================================

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export const getPublicReports = async (filters = {}) => {
  let query = supabase
    .from('reportes')
    .select(`
      id,
      codigo,
      descripcion,
      direccion,
      latitud,
      longitud,
      estado,
      prioridad,
      created_at,
      categoria:categorias(nombre, icono, color)
    `)
    .order('created_at', { ascending: false })
  
  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }
  
  if (filters.categoria_id) {
    query = query.eq('categoria_id', filters.categoria_id)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// ============================================
// CONSTANTES
// ============================================

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

export const ESTADOS_REPORTE = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: '📝' },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: '👀' },
  asignado: { label: 'Asignado', color: 'violet', icon: '👷' },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: '🔧' },
  resuelto: { label: 'Resuelto', color: 'green', icon: '✅' },
  rechazado: { label: 'Rechazado', color: 'red', icon: '❌' },
}

export const PRIORIDADES = {
  critica: { label: 'Crítica', color: '#ef4444' },
  alta: { label: 'Alta', color: '#f97316' },
  media: { label: 'Media', color: '#eab308' },
  baja: { label: 'Baja', color: '#22c55e' },
}

export default supabase