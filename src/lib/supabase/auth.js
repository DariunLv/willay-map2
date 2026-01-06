// ============================================================================
// WILLAY MAP - Servicio de Autenticación
// Manejo de login, registro, logout y sesiones
// ============================================================================

import { supabase, TABLES } from './client'

export const authService = {
  // ========================================
  // REGISTRO DE USUARIO
  // ========================================
  async registrar({ email, password, nombreCompleto, telefono, dni }) {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
          },
        },
      })

      if (authError) throw authError

      // 2. Actualizar perfil con datos adicionales
      if (authData.user) {
        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .update({
            nombre_completo: nombreCompleto,
            telefono,
            dni,
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.error('Error actualizando perfil:', profileError)
        }
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Error en registro:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // INICIO DE SESIÓN
  // ========================================
  async login({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Actualizar último acceso
      if (data.user) {
        await supabase
          .from(TABLES.PROFILES)
          .update({ ultimo_acceso: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en login:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // CERRAR SESIÓN
  // ========================================
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error en logout:', error)
      return { error }
    }
  },

  // ========================================
  // OBTENER SESIÓN ACTUAL
  // ========================================
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session, error: null }
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return { session: null, error }
    }
  },

  // ========================================
  // OBTENER USUARIO ACTUAL
  // ========================================
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return { user: null, error }
    }
  },

  // ========================================
  // OBTENER PERFIL COMPLETO DEL USUARIO
  // ========================================
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // ACTUALIZAR PERFIL
  // ========================================
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // SUBIR AVATAR
  // ========================================
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      // Subir archivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(fileName)

      // Actualizar perfil con URL
      await supabase
        .from(TABLES.PROFILES)
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('Error subiendo avatar:', error)
      return { url: null, error }
    }
  },

  // ========================================
  // RECUPERAR CONTRASEÑA
  // ========================================
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error en reset password:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // ACTUALIZAR CONTRASEÑA
  // ========================================
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error actualizando contraseña:', error)
      return { data: null, error }
    }
  },

  // ========================================
  // LISTENER DE CAMBIOS DE AUTH
  // ========================================
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },

  // ========================================
  // VERIFICAR SI ES CIUDADANO
  // ========================================
  async esCiudadano(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('rol')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data?.rol === 'ciudadano'
    } catch (error) {
      console.error('Error verificando rol:', error)
      return false
    }
  },

  // ========================================
  // VERIFICAR SI ES PERSONAL MUNICIPAL
  // ========================================
  async esPersonalMunicipal(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('rol')
        .eq('id', userId)
        .single()

      if (error) throw error
      return ['municipal_admin', 'municipal_supervisor', 'municipal_operador'].includes(data?.rol)
    } catch (error) {
      console.error('Error verificando rol:', error)
      return false
    }
  },
}

export default authService