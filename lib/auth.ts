import { clientApi } from '@/lib/clientApi'
import type { User } from '@/store/useStore'

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await clientApi.get('/auth/me')
    return response as User
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    return null
  }
}

export function getToken(): string | null {
  // Client-side: get from localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Server-side token retrieval (use this in server actions/components)
export async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    return cookieStore.get('token')?.value || null
  } catch {
    return null
  }
}