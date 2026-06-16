'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/ui/AppShell'
import LoginForm from '@/components/auth/LoginForm'
import SignupStepper from '@/components/auth/SignupStepper'
import AuthHeader from '@/components/auth/AuthHeader'

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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <AppShell
      statusBar={{
        title: isLogin ? 'Sign in' : 'Create account',
        showBack: false,
        color: 'primary',
      }}
      showBottomNav={false}
    >
      <div className="flex flex-col h-full justify-center px-4 py-4">
        {/* Single unified auth card */}
        <div
          className="max-w-md mx-auto w-full rounded-2xl overflow-hidden"
          style={{ 
            backgroundColor: 'white'
          }}
        >
          {/* Auth Header with logo and toggle buttons */}
          <div className="p-6 pb-4">
            <AuthHeader
              activeTab={isLogin ? 'signin' : 'signup'}
              onSignIn={() => setIsLogin(true)}
              onCreateAccount={() => setIsLogin(false)}
            />
          </div>

          {/* Form Container */}
          <div className="px-6 pb-6 space-y-4">
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
      </div>
    </AppShell>
  )
}