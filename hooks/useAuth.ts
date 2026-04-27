import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { getToken, setToken, clearToken } from '@/lib/auth'
import api from '@/lib/api'

interface LoginCredentials {
  phone: string
  password: string
}

interface SignupData {
  fullName: string
  phone: string
  location: string
  password: string
  status: 'pregnant' | 'postpartum_early' | 'postpartum_late' | 'unknown'
  trimester?: 'first' | 'second' | 'third' | 'term'
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setUser, logout } = useStore()

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getToken()
    if (!token) {
      logout()
    }
  }, [logout])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response.data

      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/auth/register', data)
      const { user, token } = response.data

      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logoutUser = () => {
    clearToken()
    logout()
    router.push('/auth')
  }

  return {
    login,
    signup,
    logout: logoutUser,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
