'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

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
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  async function submitRegistration(payload: unknown): Promise<{
    success: boolean;
    message?: string;
    user?: unknown;
    requiresVerification?: boolean;
    nextStep?: string;
  }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          success: false,
          message: data?.message ?? 'Registration failed',
        };
      }

      return {
        success: true,
        message: data?.message,
        user: data?.user ?? null,
        requiresVerification: data?.requiresVerification,
        nextStep: data?.nextStep,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) return

    setIsLoading(true)
    setIsSubmitted(true)
    setError(null)

    const result = await submitRegistration(formData)

    if (!result.success) {
      setError(result.message ?? 'Registration failed')
      setIsLoading(false)
      setIsSubmitted(false)
      return
    }

    if (result.requiresVerification || result.nextStep) {
      // Preserve existing verification flow if present.
      setIsLoading(false)
      setIsSubmitted(false)
      return
    }

    onSuccess()
    router.replace('/home')
    router.refresh()
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
        // Validate phone number format (10-15 digits)
        const digitsOnly = formData.phone.replace(/\D/g, '')
        const isPhoneValid = digitsOnly.length >= 10 && digitsOnly.length <= 15
        return !!(
          formData.fullName &&
          formData.phone &&
          isPhoneValid &&
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
              onUpdate={updateFormData}
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
    <>
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
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Already have an account? Sign in
          </button>
        </div>
      )}
    </>
  )
}