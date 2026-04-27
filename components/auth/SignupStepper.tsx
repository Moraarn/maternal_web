'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { UserStatus, Trimester } from '@/store/useStore'

interface SignupData {
  fullName: string
  phone: string
  location: string
  password: string
  status: UserStatus
  trimester?: Trimester
  chwName: string
  chwPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
}

interface SignupStepperProps {
  onSwitchToLogin: () => void
  onSuccess: (data: SignupData) => void
}

export default function SignupStepper({ onSwitchToLogin, onSuccess }: SignupStepperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<SignupData>({
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

  const updateFormData = (updates: Partial<SignupData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) {
      console.log('Already submitted or loading, ignoring duplicate submission')
      return
    }
    
    setIsLoading(true)
    setIsSubmitted(true)
    
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        const data = await response.json()
        // Use setToken to set both localStorage and cookie
        const { setToken } = await import('@/lib/auth')
        setToken(data.token)
        onSuccess(formData)
        // Hard redirect immediately - don't wait for anything
        window.location.href = '/home'
      } else {
        console.error('Registration failed')
        setIsLoading(false)
        setIsSubmitted(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
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
