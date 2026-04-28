import { getToken } from '@/lib/auth'
import AuthClient from '../../components/auth/AuthClient'

async function getCurrentUserServer() {
  const token = getToken()
  
  if (!token) {
    return null
  }

  try {
    // For server-side, we need to make the fetch request to our backend
    const response = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    } else {
      return null
    }
  } catch (error) {
    console.error('Failed to get current user on server:', error)
    return null
  }
}

export default async function AuthPage() {
  // Fetch user data on server
  const user = await getCurrentUserServer()

  return <AuthClient initialUser={user} />
}
