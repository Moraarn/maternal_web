import { createNextApiBridge } from 'next-api-bridge'

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

export const api = createNextApiBridge({
  baseUrl: API_URL,
  auth: {
    type: 'bearer',
    tokenCookie: 'access_token',
    header: 'Authorization',
    prefix: 'Bearer',
  },
  cookiePrefix: 'nab_',
})