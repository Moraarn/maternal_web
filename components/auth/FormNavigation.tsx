'use client'

import Button from '@/components/ui/Button'

interface FormNavigationProps {
  currentStep: number
  isLoading: boolean
  canProceed: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function FormNavigation({
  currentStep,
  isLoading,
  canProceed,
  onPrevious,
  onNext,
}: FormNavigationProps) {
  return (
    <div className="flex gap-3 mt-6">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
        >
          ← Back
        </Button>
      )}

      <Button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isLoading}
        className="flex-1"
      >
        {isLoading
          ? 'Creating account...'
          : currentStep === 3
            ? 'Create my account'
            : 'Continue →'}
      </Button>
    </div>
  )
}
