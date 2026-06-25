'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import PhoneInput from './PhoneInput'
import PasswordInput from './PasswordInput'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validatePhone = (value: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, '')
    // Allow reasonable phone length (10-15 digits for international numbers)
    return digitsOnly.length >= 10 && digitsOnly.length <= 15
  }

  const handlePhoneChange = (fullNumber: string) => {
    setPhone(fullNumber)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate phone before submission
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (10-15 digits)')
      return
    }

    setIsLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    })

    const data = await res.json().catch(() => null)

    setIsLoading(false)

    if (!res.ok) {
      setError(data?.message ?? 'Login failed')
      return
    }

    onSuccess()
    router.replace('/home')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Phone number
        </label>
        <PhoneInput
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+254 7__ ___ ___"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Password
        </label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
          disabled={isLoading}
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
        disabled={isLoading || !phone.trim() || !password.trim()}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2" style={{ backgroundColor: 'white', color: 'var(--color-text-secondary)' }}>or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={onSwitchToSignup}
        disabled={isLoading}
      >
        Create new account
      </Button>
    </form>
  )
}
