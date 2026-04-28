'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import LoginForm from '@/components/auth/LoginForm'
import SignupStepper from '@/components/auth/SignupStepper'
import { UserStatus, Trimester, User } from '@/store/useStore'
import { RegisterData } from '../../app/auth/actions'

interface AuthClientProps {
  initialUser: User | null
}

export default function AuthClient({ initialUser }: AuthClientProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const { setUser } = useStore()

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (initialUser) {
      router.push('/home')
    }
  }, [initialUser, router])

  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting to home')
    // Try multiple redirect methods
    setTimeout(() => {
      console.log('Attempting redirect to /home')
      router.push('/home')
    }, 50)
    
    // Fallback to window.location
    setTimeout(() => {
      console.log('Fallback redirect using window.location')
      window.location.href = '/home'
    }, 200)
  }

  const handleSignupSuccess = (data: RegisterData) => {
    if (isNavigating) {
      console.log('Already navigating, ignoring duplicate call')
      return
    }
    
    console.log('Signup successful:', data)
    setIsNavigating(true)
    
    // Create user object for store
    const user: User = {
      id: Date.now().toString(), // Temporary ID
      phone: data.phone,
      fullName: data.fullName,
      status: data.status as UserStatus,
      trimester: data.trimester as Trimester | undefined,
      chwName: data.chwName,
      chwPhone: data.chwPhone,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      location: data.location,
    }
    
    // Set user and store token in localStorage directly
    localStorage.setItem('continuum_token', 'mock-token-' + Date.now())
    setUser(user)
    console.log('User set in store')
    // Navigation happens in SignupStepper with hard redirect
  }

  const switchToSignup = () => {
    console.log('Switching to signup')
    setIsLogin(false)
  }

  const switchToLogin = () => {
    console.log('Switching to login')
    setIsLogin(true)
  }

  // Show loading state while checking authentication
  if (initialUser !== null && initialUser !== undefined) {
    return (
      <div className="phone-container bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Redirecting...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="phone-container bg-white">
      <div className="flex-1 flex flex-col">
        {/* Logo and header */}
        <div className="pt-12 pb-8 px-6 text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">CystaNiva</h1>
          <p className="text-text-secondary text-sm">Maternal health risk checker</p>
        </div>

        {/* Tab navigation */}
        <div className="px-6 mb-6">
          <div className="bg-gray-100 rounded-xl p-1 flex">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={switchToSignup}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Create account
            </button>
          </div>
        </div>

        {/* Form content */}
        <div className="px-6 pb-8">
          <div className="transition-opacity duration-300">
            {isLogin ? (
              <LoginForm
                onSwitchToSignup={switchToSignup}
                onSuccess={handleLoginSuccess}
              />
            ) : (
              <SignupStepper
                onSwitchToLogin={switchToLogin}
                onSuccess={handleSignupSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
