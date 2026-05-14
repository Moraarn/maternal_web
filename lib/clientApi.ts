const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

const joinUrl = (base: string, path: string) => {
  if (!base.endsWith('/') && !path.startsWith('/')) return `${base}/${path}`
  if (base.endsWith('/') && path.startsWith('/')) return `${base}${path.slice(1)}`
  return `${base}${path}`
}

const request = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`🚀 REQUEST START: ${endpoint}`)

  if (options.body) {
    try {
      console.log('📤 PAYLOAD:', JSON.parse(String(options.body)))
    } catch {
      console.log('📤 RAW PAYLOAD:', options.body)
    }
  }

  try {
    const response = await fetch(joinUrl(API_URL, endpoint), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    console.log(`📥 RESPONSE STATUS: ${response.status}`)

    const text = await response.text()
    console.log('📥 RAW RESPONSE:', text)

    let json: any = null

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

  delete: (endpoint: string) =>
    request(endpoint, { method: 'DELETE' }),
}