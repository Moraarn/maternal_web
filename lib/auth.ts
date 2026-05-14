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