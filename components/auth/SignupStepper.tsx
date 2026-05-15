'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ProgressDots from './ProgressDots'
import PersonalDetailsStep from './PersonalDetailsStep'
import HealthStatusStep from './HealthStatusStep'
import CareTeamStep from './CareTeamStep'
import FormNavigation from './FormNavigation'
import { RegisterData, SignupStepperProps } from '../../lib/types'

export default function SignupStepper({
  onSwitchToLogin,
  onSuccess,
}: SignupStepperProps) {
  const { signup, clearError } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

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

  const locationInputRef = useRef<HTMLInputElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const updateFormData = (updates: Partial<RegisterData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) return

    setIsLoading(true)
    setIsSubmitted(true)
    setError(null)
    clearError()

    try {
      const result = await signup(formData)

      if (result.success) {
        onSuccess()
        return
      }

      setError(result.error || 'Registration failed')
      setIsLoading(false)
      setIsSubmitted(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      setIsLoading(false)
      setIsSubmitted(false)
    }
  }

  const nextStep = () => {
    if (isLoading || isSubmitted) return

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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.fullName &&
          formData.phone &&
          formData.location &&
          formData.password.length >= 6
        )

      case 2:
        return !!(
          formData.status !== 'unknown' &&
          (formData.status !== 'pregnant' || formData.trimester)
        )

      case 3:
        return !!formData.phone

      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Your details
            </h2>
            <PersonalDetailsStep
              formData={formData}
              showMap={showMap}
              onUpdate={updateFormData}
              onMapToggle={setShowMap}
              locationInputRef={locationInputRef}
              mapContainerRef={mapContainerRef}
              mapRef={mapRef}
              markerRef={markerRef}
              geocoderRef={geocoderRef}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Health status
            </h2>
            <HealthStatusStep
              formData={formData}
              onUpdate={updateFormData}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Care team
            </h2>
            <CareTeamStep
              formData={formData}
              onUpdate={updateFormData}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <ProgressDots currentStep={currentStep} totalSteps={3} />

      {renderStep()}

      {error && (
        <div className="text-red-500 text-sm mt-4">
          {error}
        </div>
      )}

      <FormNavigation
        currentStep={currentStep}
        isLoading={isLoading}
        canProceed={canProceed()}
        onPrevious={prevStep}
        onNext={nextStep}
      />

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