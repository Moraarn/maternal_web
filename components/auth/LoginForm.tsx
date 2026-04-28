'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useStore } from '@/store/useStore'
import { signIn } from '@/app/auth/actions'
import { showResponseToast } from 'next-api-bridge/form'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { setUser } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('phone', phone)
      formData.append('password', password)
      formData.append('redirectPath', '/home')
      
      const result = await signIn(null, formData)
      
      if (result.success && result.body) {
        setUser(result.body)
        onSuccess()
        router.push('/home')
      } else {
        setError(result.message || 'Login failed')
        showResponseToast({ state: result })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254 7__ ___ ___"
          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-primary hover:underline"
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
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-text-secondary">or</span>
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
