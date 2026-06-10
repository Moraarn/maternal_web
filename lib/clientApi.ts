const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

const joinUrl = (base: string, path: string) => {
  const cleanBase = base.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanBase}${cleanPath}`
}

const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = joinUrl(API_URL, endpoint)

  console.log(`🚀 REQUEST START: ${endpoint}`)
  console.log(`🌍 REQUEST URL: ${url}`)

  if (options.body) {
    try {
      console.log('📤 PAYLOAD:', JSON.parse(String(options.body)))
    } catch {
      console.log('📤 RAW PAYLOAD:', options.body)
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    console.log(`📥 RESPONSE STATUS: ${response.status}`)

    const text = await response.text()
    console.log('📥 RAW RESPONSE:', text)

    let json: any = {}

    try {
      json = text ? JSON.parse(text) : {}
      console.log('✅ PARSED RESPONSE:', json)
    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError)
      throw new Error('Server returned invalid JSON')
    }

    if (!response.ok) {
      throw new Error(json?.message || `HTTP ${response.status}`)
    }

    return json
  } catch (error) {
    console.error(`❌ REQUEST FAILED: ${endpoint}`, error)
    throw error
  }
}

export const clientApi = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),

  post: (endpoint: string, data?: unknown) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: unknown) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
}