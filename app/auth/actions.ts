import { setToken, clearToken } from '../../lib/auth'
import { UserStatus, Trimester } from '@/store/useStore'

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  fullName: string
  phone: string
  location: string
  password: string
  status: string
  trimester?: string
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface AuthResponse {
  user: {
    id: string
    phone: string
    fullName: string
    status: UserStatus
    trimester?: Trimester
    weeksCount?: number
    chwName?: string
    chwPhone?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    location?: string
  }
  token: string
  message: string
}

export interface ApiError {
  error: string
  status?: number
}

export class AuthApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'AuthApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  
  if (!response.ok) {
    throw new AuthApiError(data.error || 'Request failed', response.status)
  }
  
  return data
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await handleResponse<AuthResponse>(response)
  
  // Store token on successful login
  setToken(data.token)
  
  return data
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  const response = await fetch('http://localhost:5000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const data = await handleResponse<AuthResponse>(response)
  
  // Store token on successful registration
  setToken(data.token)
  
  return data
}

export async function createOtp(phoneNumber: string): Promise<{ message: string; otp: string }> {
  const response = await fetch('http://localhost:5000/auth/otp/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  })

  return handleResponse<{ message: string; otp: string }>(response)
}

export async function verifyOtp(phoneNumber: string, code: string): Promise<{ valid: boolean }> {
  const response = await fetch('http://localhost:5000/auth/otp/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, code }),
  })

  return handleResponse<{ valid: boolean }>(response)
}

export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint if it exists
    await fetch('http://localhost:5000/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // Continue with client-side logout even if backend call fails
    console.warn('Backend logout failed:', error)
  }
  
  // Clear client-side token
  clearToken()
}

export async function getCurrentUser(): Promise<AuthResponse['user'] | null> {
  const token = localStorage.getItem('continuum_token')
  
  if (!token) {
    return null
  }

  try {
    const response = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.ok) {
      return handleResponse<AuthResponse['user']>(response)
    } else {
      // Token is invalid, clear it
      clearToken()
      return null
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    clearToken()
    return null
  }
}
