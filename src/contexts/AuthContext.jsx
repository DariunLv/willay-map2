// ============================================================================
// WILLAY MAP - Contexto de Autenticación
// Maneja el estado global de autenticación
// ============================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase, authService } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // ========================================
  // CARGAR PERFIL DEL USUARIO
  // ========================================
  const loadProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await authService.getProfile(userId)
      if (error) throw error
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error cargando perfil:', error)
      return null
    }
  }, [])

  // ========================================
  // INICIALIZAR SESIÓN
  // ========================================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session } = await authService.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error inicializando auth:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    // Suscribirse a cambios de auth
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadProfile])

  // ========================================
  // REGISTRO
  // ========================================
  const registrar = async ({ email, password, nombreCompleto, telefono, dni }) => {
    setLoading(true)
    try {
      const { data, error } = await authService.registrar({
        email,
        password,
        nombreCompleto,
        telefono,
        dni,
      })

      if (error) throw error

      notifications.show({
        title: '¡Registro exitoso!',
        message: 'Revisa tu correo para confirmar tu cuenta',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      return { data, error: null }
    } catch (error) {
      notifications.show({
        title: 'Error en registro',
        message: error.message || 'No se pudo completar el registro',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // LOGIN
  // ========================================
  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await authService.login({ email, password })

      if (error) throw error

      notifications.show({
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      // Redirigir según rol
      if (data.user) {
        const profileData = await loadProfile(data.user.id)
        const redirectPath = getRedirectPath(profileData?.rol)
        router.push(redirectPath)
      }

      return { data, error: null }
    } catch (error) {
      notifications.show({
        title: 'Error de acceso',
        message: error.message || 'Credenciales incorrectas',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // LOGOUT
  // ========================================
  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await authService.logout()
      if (error) throw error

      setUser(null)
      setProfile(null)

      notifications.show({
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión correctamente',
        color: 'blue',
      })

      router.push('/login')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // ACTUALIZAR PERFIL
  // ========================================
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No autenticado') }

    try {
      const { data, error } = await authService.updateProfile(user.id, updates)
      if (error) throw error

      setProfile(data)

      notifications.show({
        title: 'Perfil actualizado',
        message: 'Los cambios han sido guardados',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      return { data, error: null }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo actualizar el perfil',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { data: null, error }
    }
  }

  // ========================================
  // SUBIR AVATAR
  // ========================================
  const uploadAvatar = async (file) => {
    if (!user) return { error: new Error('No autenticado') }

    try {
      const { url, error } = await authService.uploadAvatar(user.id, file)
      if (error) throw error

      setProfile((prev) => ({ ...prev, avatar_url: url }))

      return { url, error: null }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo subir la imagen',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { url: null, error }
    }
  }

  // ========================================
  // RECUPERAR CONTRASEÑA
  // ========================================
  const resetPassword = async (email) => {
    try {
      const { error } = await authService.resetPassword(email)
      if (error) throw error

      notifications.show({
        title: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      return { error: null }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'No se pudo enviar el correo',
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { error }
    }
  }

  // ========================================
  // HELPERS
  // ========================================
  const esCiudadano = profile?.rol === 'ciudadano'
  const esPersonalMunicipal = ['municipal_admin', 'municipal_supervisor', 'municipal_operador'].includes(profile?.rol)
  const esAdmin = profile?.rol === 'municipal_admin'
  const esCuadrilla = profile?.rol === 'cuadrilla'

  const value = {
    user,
    profile,
    loading,
    initialized,
    registrar,
    login,
    logout,
    updateProfile,
    uploadAvatar,
    resetPassword,
    loadProfile,
    // Helpers
    esCiudadano,
    esPersonalMunicipal,
    esAdmin,
    esCuadrilla,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ========================================
// HOOK PERSONALIZADO
// ========================================
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// ========================================
// HELPER: OBTENER RUTA DE REDIRECCIÓN
// ========================================
function getRedirectPath(rol) {
  switch (rol) {
    case 'ciudadano':
      return '/ciudadano/dashboard'
    case 'municipal_admin':
    case 'municipal_supervisor':
    case 'municipal_operador':
      return '/municipal/dashboard'
    case 'cuadrilla':
      return '/cuadrilla/dashboard'
    default:
      return '/ciudadano/dashboard'
  }
}

// ========================================
// HOC: PROTEGER RUTAS
// ========================================
export function withAuth(Component, options = {}) {
  const { allowedRoles = null, redirectTo = '/login' } = options

  return function AuthenticatedComponent(props) {
    const { user, profile, loading, initialized } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!initialized) return

      // No autenticado
      if (!user) {
        router.replace(redirectTo)
        return
      }

      // Verificar rol si se especifica
      if (allowedRoles && profile && !allowedRoles.includes(profile.rol)) {
        const correctPath = getRedirectPath(profile.rol)
        router.replace(correctPath)
      }
    }, [user, profile, initialized, router])

    // Mostrar loading mientras verifica
    if (loading || !initialized) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: 16, color: '#64748b' }}>Verificando acceso...</p>
          </div>
          <style jsx>{`
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #e2e8f0;
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    // No autenticado
    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

export default AuthContext