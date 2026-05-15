'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login, isLoading: authLoading, error: authError, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    clearError()

    const result = await login({ phone, password })

    if (result.success) {
      onSuccess()
      router.push('/home')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254 7__ ___ ___"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
          required
          disabled={authLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
          required
          disabled={authLoading}
        />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-lg" style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-red-light)' }}>
          {error}
        </div>
      )}

      <div className="text-right">
        <button
          type="button"
          className="text-sm hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={authLoading || !phone.trim() || !password.trim()}
      >
        {authLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={onSwitchToSignup}
        disabled={authLoading}
      >
        Create new account
      </Button>
    </form>
  )
}
