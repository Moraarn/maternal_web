'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clientApi } from '@/lib/clientApi'

interface LoginCredentials {
  phone: string
  password: string
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    console.log('🔐 LOGIN START')
    setIsLoading(true)
    setError(null)

    try {
      const response = await clientApi.post('/auth/login', credentials)

      console.log('✅ LOGIN RESPONSE:', response)

      const user = response.user
      const token = response.accessToken

      if (!user || !token) {
        throw new Error('Invalid login response (missing user/token)')
      }

      // SINGLE SOURCE OF TRUTH (frontend session)
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('accessToken', token)

      console.log('💾 SESSION STORED')

      return {
        success: true,
        user,
        token,
      }
    } catch (err: any) {
      console.error('❌ LOGIN ERROR:', err)
      setError(err.message || 'Login failed')

      return {
        success: false,
        error: err.message,
      }
    } finally {
      setIsLoading(false)
      console.log('🔐 LOGIN END')
    }
  }

  const signup = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await clientApi.post('/auth/register', data)

      localStorage.setItem('currentUser', JSON.stringify(response.user))
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken)
      }

      return { success: true, user: response.user }
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    router.replace('/auth')
  }

  return {
    login,
    signup,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}