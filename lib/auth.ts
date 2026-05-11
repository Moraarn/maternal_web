import { clientApi } from '@/lib/clientApi'
import type { User } from '@/store/useStore'

export const getToken = (): string | null => {
  // Token is stored in HTTP-only cookie by backend
  // JavaScript cannot read HTTP-only cookies for security
  // The browser automatically sends the cookie with requests when credentials: 'include'
  // This function returns null as we rely on the backend to validate the cookie
  return null;
}

export const isAuthenticated = (): boolean => {
  // We can't check authentication on the client side without making a request
  // This function is deprecated - use fetchCurrentUser() instead
  return false;
}

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await clientApi.get('/auth/me')
    return response as User
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    return null
  }
}
