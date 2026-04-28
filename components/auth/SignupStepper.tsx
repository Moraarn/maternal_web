'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { UserStatus, Trimester } from '@/store/useStore'
import { signUp, RegisterData } from '@/app/auth/actions'
import { showResponseToast } from 'next-api-bridge/form'
import { useStore } from '@/store/useStore'

interface SignupStepperProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export default function SignupStepper({ onSwitchToLogin, onSuccess }: SignupStepperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    phone: '',
    location: '',
    password: '',
    status: 'unknown',
    trimester: undefined,
    chwName: '',
    chwPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  const updateFormData = (updates: Partial<RegisterData>) => {
    setFormData((prev: RegisterData) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) {
      console.log('Already submitted or loading, ignoring duplicate submission')
      return
    }
    
    setIsLoading(true)
    setIsSubmitted(true)
    setError(null)
    
    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })
      formDataToSend.append('redirectPath', '/home')
      
      const result = await signUp(null, formDataToSend)
      
      // If we get here, it means the server action completed but didn't redirect
      // This could happen if the redirect mechanism failed
      console.log('Server action completed, performing client-side redirect')
      
      // Set user state if we have user data from the response
      if (result && result.body) {
        const { setUser } = useStore.getState()
        setUser(result.body)
        console.log('User set in store from registration response')
      }
      
      onSuccess()
      showResponseToast({ state: { success: true, message: 'Registration successful!', body: result?.body || null } })
      
      // Perform client-side redirect as fallback
      setTimeout(() => {
        console.log('Performing client-side redirect to /home')
        window.location.href = '/home'
      }, 1000)
      
    } catch (error) {
      console.error('Registration error:', error)
      
      // Check if this is a redirect error (which means success)
      if (error instanceof Error && (
        error.message.includes('NEXT_REDIRECT') ||
        error.message.includes('redirect') ||
        error.message.includes('NEXT_REDIRECT')
      )) {
        // Registration was successful, server is redirecting
        console.log('Server redirect detected, calling onSuccess')
        onSuccess()
        return // Don't set loading to false since we're redirecting
      }
      
      // Check if this is an API error response
      if (error && typeof error === 'object' && 'success' in error) {
        const apiError = error as any
        setError(apiError.message || 'Registration failed')
        showResponseToast({ state: apiError })
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
      
      setIsLoading(false)
      setIsSubmitted(false)
    }
  }

  const nextStep = () => {
    if (isLoading || isSubmitted) {
      console.log('Already submitting or submitted, ignoring click')
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const statusOptions = [
    {
      value: 'pregnant' as UserStatus,
      emoji: '🤰',
      label: 'Pregnant',
      subtitle: 'Currently expecting'
    },
    {
      value: 'postpartum_early' as UserStatus,
      emoji: '👶',
      label: 'New mama',
      subtitle: 'Gave birth recently (0–6 wks)'
    },
    {
      value: 'postpartum_late' as UserStatus,
      emoji: '🌸',
      label: 'Recovering',
      subtitle: 'Birth was 6–12 weeks ago'
    },
    {
      value: 'unknown' as UserStatus,
      emoji: '❓',
      label: 'Not sure',
      subtitle: "I'll check both"
    }
  ]

  const trimesterOptions = [
    { value: 'first' as Trimester, label: '1–12 wks' },
    { value: 'second' as Trimester, label: '13–26 wks' },
    { value: 'third' as Trimester, label: '27–36 wks' },
    { value: 'term' as Trimester, label: '37+ wks' }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Your details</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
                placeholder="e.g. Amina Wanjiru"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Your location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                placeholder="e.g. Kibera, Nairobi"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Create a password
                <span className="text-text-secondary font-normal"> (min. 6 characters)</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Your health status</h2>
            <p className="text-text-secondary">I am currently…</p>
            
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFormData({ status: option.value, trimester: undefined })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.status === option.value
                      ? 'border-primary bg-green-light'
                      : 'border-border bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="font-semibold text-sm text-text-primary">{option.label}</div>
                  <div className="text-xs text-text-secondary mt-1">{option.subtitle}</div>
                </button>
              ))}
            </div>
            
            {formData.status === 'pregnant' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  How far along?
                </label>
                <div className="flex gap-2">
                  {trimesterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData({ trimester: option.value })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.trimester === option.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Your care team</h2>
            <p className="text-text-secondary text-sm">
              This helps us alert the right people in an emergency
            </p>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Health worker's name
                <span className="text-text-secondary font-normal"> (optional)</span>
              </label>
              <input
                type="text"
                value={formData.chwName}
                onChange={(e) => updateFormData({ chwName: e.target.value })}
                placeholder="e.g. Nurse Fatuma Wanjiku"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Health worker's phone
              </label>
              <input
                type="tel"
                value={formData.chwPhone}
                onChange={(e) => updateFormData({ chwPhone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emergency contact name
                <span className="text-text-secondary font-normal"> (optional)</span>
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                placeholder="e.g. Margaret (sister)"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emergency contact phone
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.phone && formData.location && formData.password.length >= 6
      case 2:
        return formData.status !== 'unknown' && (formData.status !== 'pregnant' || formData.trimester)
      case 3:
        return formData.phone // Phone is required for registration
      default:
        return false
    }
  }

  return (
    <div>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-2 transition-all ${
              step === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
            } rounded-full`}
          />
        ))}
      </div>
      
      {renderStep()}
      
      {error && (
        <div className="text-red-500 text-sm mt-4">{error}</div>
      )}
      
      <div className="flex gap-3 mt-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
          >
            ← Back
          </Button>
        )}
        
        <Button
          type="button"
          onClick={nextStep}
          disabled={!canProceed() || isLoading || isSubmitted}
          className="flex-1"
        >
          {isLoading ? 'Creating account...' : currentStep === 3 ? 'Create my account' : 'Continue →'}
        </Button>
      </div>
      
      {currentStep === 1 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      )}
    </div>
  )
}
