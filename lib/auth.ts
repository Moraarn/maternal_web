export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage
    return localStorage.getItem('continuum_token')
  }
  // Server-side: return null (middleware will handle this differently)
  return null
}

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('continuum_token', token)
    // Also set a cookie for middleware access
    document.cookie = `continuum_token=${token}; path=/; max-age=86400; same-site=strict`
  }
}

export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('continuum_token')
    // Clear the cookie
    document.cookie = 'continuum_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}
