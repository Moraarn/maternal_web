'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useStore } from '@/store/useStore'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Login successful, data:', data)
        
        // TODO: Fix auth library import issue
        // setToken(data.token)
        localStorage.setItem('continuum_token', data.token)
        
        // Set user data in store
        if (data.user) {
          console.log('Setting user in store:', data.user)
          setUser(data.user)
        }
        
        console.log('Calling onSuccess callback')
        onSuccess()
        
        // Also try direct navigation as fallback
        setTimeout(() => {
          console.log('Attempting direct navigation to /home')
          router.push('/home')
        }, 100)
      } else {
        // Handle error
        console.error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
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
        />
      </div>
      
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
      >
        Create new account
      </Button>
    </form>
  )
}
