import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Obtener perfil del usuario desde tabla USUARIOS
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      return null
    }
  }

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          const perfil = await fetchProfile(session.user.id)
          setProfile(perfil)
        }
      } catch (error) {
        console.error('Error iniciando auth:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initAuth()

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const perfil = await fetchProfile(session.user.id)
        setProfile(perfil)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Registrar ciudadano
  const registrar = async ({ email, password, nombreCompleto, telefono, dni }) => {
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombreCompleto }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: nombreCompleto,
            telefono: telefono || null,
            dni: dni || null,
            rol: 'ciudadano',
          })

        if (profileError) throw profileError
      }

      notifications.show({
        title: '¡Registro exitoso!',
        message: 'Ya puedes iniciar sesión',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      return { error: null }
    } catch (error) {
      console.error('Error en registro:', error)
      notifications.show({
        title: 'Error en registro',
        message: error.message,
        color: 'red',
        icon: <IconX size={18} />,
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const perfil = await fetchProfile(data.user.id)
      setUser(data.user)
      setProfile(perfil)

      notifications.show({
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      const rol = perfil?.rol || 'ciudadano'
      
      // Usar window.location para evitar problemas con router
      if (rol === 'municipal' || rol === 'admin') {
        window.location.href = '/municipal/dashboard'
      } else {
        window.location.href = '/ciudadano/dashboard'
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error en login:', error)
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

  // Logout
  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Error en logout:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  // Actualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No autenticado') }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

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

  const value = {
    user,
    profile,
    loading,
    initialized,
    registrar,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    esCiudadano: profile?.rol === 'ciudadano',
    esMunicipal: profile?.rol === 'municipal',
    esAdmin: profile?.rol === 'admin',
    esPersonalMunicipal: ['admin', 'municipal', 'supervisor', 'operador'].includes(profile?.rol),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// HOC para proteger rutas - CORREGIDO
export function withAuth(Component, options = {}) {
  const { allowedRoles = null, redirectTo = '/login' } = options

  return function AuthenticatedComponent(props) {
    const { user, profile, loading, initialized } = useAuth()
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
      // Esperar a que el router esté listo
      if (!router.isReady) return
      if (!initialized) return

      const checkAuth = () => {
        // Si no hay usuario, redirigir a login
        if (!user) {
          window.location.href = redirectTo
          return
        }

        // Verificar roles permitidos
        if (allowedRoles && profile) {
          const userRol = profile.rol || 'ciudadano'
          
          if (!allowedRoles.includes(userRol)) {
            // Si no tiene permiso, redirigir a su dashboard
            if (userRol === 'municipal' || userRol === 'admin') {
              window.location.href = '/municipal/dashboard'
            } else {
              window.location.href = '/ciudadano/dashboard'
            }
            return
          }
        }

        setIsChecking(false)
      }

      checkAuth()
    }, [user, profile, initialized, router.isReady])

    // Mostrar loading mientras verifica
    if (loading || !initialized || isChecking || !router.isReady) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#64748b' }}>Cargando...</p>
          </div>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    if (!user) return null

    return <Component {...props} />
  }
}

export default AuthContext