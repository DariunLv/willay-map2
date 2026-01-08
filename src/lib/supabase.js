import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ============================================
// CONSTANTES
// ============================================

export const CATEGORIAS_REPORTE = {
  bache: { label: 'Baches', icon: 'IconRoadOff', color: '#6b7280' },
  alumbrado: { label: 'Alumbrado Público', icon: 'IconBulbOff', color: '#f59e0b' },
  basura: { label: 'Residuos Sólidos', icon: 'IconTrash', color: '#84cc16' },
  agua_alcantarillado: { label: 'Agua/Alcantarillado', icon: 'IconDroplet', color: '#3b82f6' },
  senalizacion: { label: 'Señalización', icon: 'IconAlertTriangle', color: '#ef4444' },
  areas_verdes: { label: 'Áreas Verdes', icon: 'IconTree', color: '#22c55e' },
  infraestructura: { label: 'Infraestructura', icon: 'IconBuilding', color: '#8b5cf6' },
  otros: { label: 'Otros', icon: 'IconDots', color: '#64748b' },
}

export const ESTADOS_REPORTE = {
  nuevo: { label: 'Nuevo', color: 'blue', icon: 'IconFileDescription' },
  en_revision: { label: 'En Revisión', color: 'yellow', icon: 'IconEye' },
  asignado: { label: 'Asignado', color: 'violet', icon: 'IconTruck' },
  en_proceso: { label: 'En Proceso', color: 'orange', icon: 'IconTool' },
  resuelto: { label: 'Resuelto', color: 'green', icon: 'IconCheck' },
  rechazado: { label: 'Rechazado', color: 'red', icon: 'IconX' },
}

export const PRIORIDADES = {
  critica: { label: 'Crítica', color: '#ef4444' },
  alta: { label: 'Alta', color: '#f97316' },
  media: { label: 'Media', color: '#eab308' },
  baja: { label: 'Baja', color: '#22c55e' },
}

// ============================================
// AUTENTICACIÓN
// ============================================

export const registerCitizen = async ({ email, password, fullName, dni, phone }) => {
  // 1. Crear usuario en Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  
  if (error) throw error
  
  // 2. Crear perfil en tabla USUARIOS (no profiles)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('usuarios')  // CORREGIDO: era 'profiles'
      .insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        telefono: phone || null,
        dni: dni || null,
        rol: 'ciudadano',  // CORREGIDO: era 'role'
      })
    
    if (profileError) {
      console.error('Error creando perfil:', profileError)
    }
  }
  
  return data
}

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // CORREGIDO: buscar en tabla 'usuarios' no 'profiles'
  const { data: profile } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { ...user, profile }
}

export const getUserProfile = async (userId) => {
  // CORREGIDO: buscar en tabla 'usuarios' no 'profiles'
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// CATEGORÍAS
// ============================================

export const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

// ============================================
// REPORTES
// ============================================

export const crearReporte = async ({ categoriaId, descripcion, direccion, latitud, longitud, fotoFile, usuarioId }) => {
  let fotoUrl = null
  
  // Subir foto si existe
  if (fotoFile) {
    const fileExt = fotoFile.name.split('.').pop()
    const fileName = `${usuarioId}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('reportes-fotos')
      .upload(fileName, fotoFile)
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('reportes-fotos')
      .getPublicUrl(fileName)
    
    fotoUrl = publicUrl
  }
  
  // Crear reporte
  const { data, error } = await supabase
    .from('reportes')
    .insert({
      usuario_id: usuarioId,
      categoria_id: categoriaId,
      descripcion,
      direccion,
      latitud,
      longitud,
      foto_url: fotoUrl,
      estado: 'nuevo',
      prioridad: 'media',
    })
    .select(`
      *,
      categoria:categorias(nombre, icono, color)
    `)
    .single()
  
  if (error) throw error
  
  // Crear historial inicial
  await supabase
    .from('historial_estados')
    .insert({
      reporte_id: data.id,
      estado_nuevo: 'nuevo',
      comentario: 'Reporte creado'
    })
  
  return data
}

export const getMisReportes = async (usuarioId) => {
  const { data, error } = await supabase
    .from('reportes')
    .select(`
      *,
      categoria:categorias(nombre, icono, color)
    `)
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getReporteById = async (reporteId) => {
  const { data, error } = await supabase
    .from('reportes')
    .select(`
      *,
      categoria:categorias(nombre, icono, color),
      historial:historial_estados(*)
    `)
    .eq('id', reporteId)
    .single()
  
  if (error) throw error
  return data
}

export const getReportesPublicos = async (filters = {}) => {
  let query = supabase
    .from('reportes')
    .select(`
      *,
      categoria:categorias(nombre, icono, color)
    `)
    .order('created_at', { ascending: false })
  
  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }
  
  if (filters.categoriaId) {
    query = query.eq('categoria_id', filters.categoriaId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

// ============================================
// ESTADÍSTICAS
// ============================================

export const getEstadisticas = async (usuarioId) => {
  const { data, error } = await supabase
    .from('reportes')
    .select('estado')
    .eq('usuario_id', usuarioId)
  
  if (error) throw error
  
  const stats = {
    total: data.length,
    nuevo: data.filter(r => r.estado === 'nuevo').length,
    en_proceso: data.filter(r => ['en_revision', 'asignado', 'en_proceso'].includes(r.estado)).length,
    resuelto: data.filter(r => r.estado === 'resuelto').length,
    rechazado: data.filter(r => r.estado === 'rechazado').length,
  }
  
  return stats
}

export const getEstadisticasGlobales = async () => {
  const { data, error } = await supabase
    .from('reportes')
    .select('estado')
  
  if (error) throw error
  
  return {
    total: data.length,
    resueltos: data.filter(r => r.estado === 'resuelto').length,
    enProceso: data.filter(r => ['en_revision', 'asignado', 'en_proceso'].includes(r.estado)).length,
    pendientes: data.filter(r => r.estado === 'nuevo').length,
  }
}

// VERIFICACIÓN

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && 
         !url.includes('placeholder') &&
         !url.includes('tu_url_aqui')
}

export default supabase