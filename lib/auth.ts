import { clientApi } from '@/lib/clientApi'
import type { User } from '@/store/useStore'

export const AUTH_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export function getBackendApiUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error('BACKEND_API_URL is not configured');
  }
  return url.replace(/\/$/, '');
}

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
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null
  } catch {
    return null
  }
}