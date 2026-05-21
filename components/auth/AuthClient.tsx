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
      <div className="flex flex-col h-full px-4 py-4">
        {/* Auth Header with logo and toggle buttons */}
        <AuthHeader
          activeTab={isLogin ? 'signin' : 'signup'}
          onSignIn={() => setIsLogin(true)}
          onCreateAccount={() => setIsLogin(false)}
        />

        {/* Form Container */}
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
    </AppShell>
  )
}