'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignupStepper from '@/components/auth/SignupStepper'

export default function AuthClient({ initialUser }: any) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Don't redirect based on localStorage - let the middleware handle authentication via cookies
    // The middleware will redirect authenticated users away from /auth automatically
    setLoading(false)
  }, [])

  const handleSuccess = () => {
    console.log('🚀 LOGIN SUCCESS → REDIRECT')
    window.location.replace('/home')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }
 
  return (
    <div className="px-6 pt-10">
      <div className="flex gap-2 mb-6">
        <button onClick={() => setIsLogin(true)}>Login</button>
        <button onClick={() => setIsLogin(false)}>Signup</button>
      </div>

      <div 
        className="rounded-2xl p-6 space-y-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {isLogin ? (
          <LoginForm
            onSwitchToSignup={() => setIsLogin(false)}
            onSuccess={handleSuccess}
          />
        ) : (
          <SignupStepper
            onSwitchToLogin={() => setIsLogin(true)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}