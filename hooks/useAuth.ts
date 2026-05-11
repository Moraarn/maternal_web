import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/auth/login', credentials)
      const { user, accessToken } = response.data
      console.log('🔑 [useAuth] Login response:', { user, hasAccessToken: !!accessToken })
      // Store token for fallback if cookies don't work
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        console.log('💾 [useAuth] Token stored in localStorage')
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      }
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
      const { user, accessToken } = response.data
      console.log('🔑 [useAuth] Signup response:', { user, hasAccessToken: !!accessToken })
      // Store token for fallback if cookies don't work
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        console.log('💾 [useAuth] Token stored in localStorage')
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      }
      return { success: true, user }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logoutUser = async () => {
    try {
      // Call backend logout endpoint to clear HTTP-only cookie
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('access_token')
      delete api.defaults.headers.common['Authorization']
      // Redirect to auth page
      router.push('/auth')
    }
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
