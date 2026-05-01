export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check for cookie first (HTTP-only cookies set by backend)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('CystaNiva_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem('CystaNiva_token');
  }
  // Server-side: return null (middleware will handle this differently)
  return null;
}

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    // Keep localStorage for backward compatibility
    localStorage.setItem('CystaNiva_token', token)
    // Note: HTTP-only cookies are set by the backend, not client-side
  }
}

export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('CystaNiva_token')
    // Note: HTTP-only cookies are cleared by the backend logout endpoint
    // Clear any non-HTTP-only cookies as fallback
    document.cookie = 'CystaNiva_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export const isAuthenticated = (): boolean => {
  return !!getToken()
}
