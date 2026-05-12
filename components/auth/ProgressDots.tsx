'use client'

interface ProgressDotsProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1
        return (
          <div
            key={step}
            className={`h-2 transition-all ${
              step === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
            } rounded-full`}
          />
        )
      })}
    </div>
  )
}
