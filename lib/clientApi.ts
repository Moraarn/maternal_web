const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const request = async (endpoint: string, options: RequestInit) => {
  // Restore token from localStorage for Authorization header
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  console.log('🔍 [clientApi] Request:', { endpoint, hasToken: !!token, tokenPreview: token ? token.substring(0, 20) + '...' : 'none' });

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include', // REQUIRED for HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    // force logout flow if needed
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const clientApi = {
  get: (endpoint: string) =>
    request(endpoint, { method: 'GET' }),

  post: (endpoint: string, data?: any) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: any) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) =>
    request(endpoint, { method: 'DELETE' }),
};