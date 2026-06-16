'use client'

interface ProgressDotsProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = ['Your details', 'Health information', 'Create password']

export default function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="mb-6">
      {/* Step indicator text */}
      <div className="text-center mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          Step {currentStep} of {totalSteps}
        </span>
        <span className="mx-2" style={{ color: 'var(--color-text-secondary)' }}>•</span>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {stepLabels[currentStep - 1]}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1
          return (
            <div
              key={step}
              className={`h-2 transition-all ${
                step === currentStep ? 'w-8' : 'w-2'
              } rounded-full`}
              style={{
                backgroundColor: step === currentStep ? 'var(--color-primary)' : 'var(--color-border)'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
