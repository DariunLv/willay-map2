import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase, getCurrentUser, getUserProfile, login as loginFn, logout as logoutFn, registerCitizen } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX } from '@tabler/icons-react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setProfile(currentUser.profile)
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
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setProfile(currentUser?.profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Registrar
  const registrar = async ({ email, password, nombreCompleto, telefono, dni }) => {
    setLoading(true)
    try {
      await registerCitizen({
        email,
        password,
        fullName: nombreCompleto,
        dni,
        phone: telefono,
      })

      notifications.show({
        title: '¡Registro exitoso!',
        message: 'Revisa tu correo para confirmar tu cuenta',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      return { error: null }
    } catch (error) {
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
      const data = await loginFn(email, password)

      notifications.show({
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
        color: 'green',
        icon: <IconCheck size={18} />,
      })

      // Obtener usuario y redirigir
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setProfile(currentUser?.profile)

      const rol = currentUser?.profile?.role || 'ciudadano'
      const redirectPath = rol === 'ciudadano' ? '/ciudadano/dashboard' : '/municipal/dashboard'
      router.push(redirectPath)

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

  // Logout
  const logout = async () => {
    setLoading(true)
    try {
      await logoutFn()
      setUser(null)
      setProfile(null)
      router.push('/login')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No autenticado') }

    try {
      const { data, error } = await supabase
        .from('profiles')
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

  // Subir avatar
  const uploadAvatar = async (file) => {
    if (!user) return { error: new Error('No autenticado') }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(fileName)

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }))

      return { url: publicUrl, error: null }
    } catch (error) {
      return { url: null, error }
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
    uploadAvatar,
    isAuthenticated: !!user,
    esCiudadano: profile?.role === 'ciudadano',
    esPersonalMunicipal: ['admin', 'supervisor', 'operador'].includes(profile?.role),
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

// HOC para proteger rutas
export function withAuth(Component, options = {}) {
  const { allowedRoles = null, redirectTo = '/login' } = options

  return function AuthenticatedComponent(props) {
    const { user, profile, loading, initialized } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!initialized) return

      if (!user) {
        router.replace(redirectTo)
        return
      }

      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        router.replace('/ciudadano/dashboard')
      }
    }, [user, profile, initialized, router])

    if (loading || !initialized) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <p>Cargando...</p>
        </div>
      )
    }

    if (!user) return null

    return <Component {...props} />
  }
}

export default AuthContext