'use client'

import { UserStatus, Trimester } from '@/store/useStore'
import { RegisterData } from '../../lib/types'

interface HealthStatusStepProps {
  formData: RegisterData
  onUpdate: (updates: Partial<RegisterData>) => void
}

const statusOptions = [
  {
    value: 'pregnant' as UserStatus,
    emoji: '🤰',
    label: 'Pregnant',
    subtitle: 'Currently expecting',
  },
  {
    value: 'postpartum_early' as UserStatus,
    emoji: '👶',
    label: 'New mama',
    subtitle: 'Gave birth recently (0–6 wks)',
  },
  {
    value: 'postpartum_late' as UserStatus,
    emoji: '🌸',
    label: 'Recovering',
    subtitle: 'Birth was 6–12 weeks ago',
  },
  {
    value: 'unknown' as UserStatus,
    emoji: '❓',
    label: 'Not sure',
    subtitle: "I'll check both",
  },
]

const trimesterOptions = [
  { value: 'first' as Trimester, label: '1–12 wks' },
  { value: 'second' as Trimester, label: '13–26 wks' },
  { value: 'third' as Trimester, label: '27–36 wks' },
  { value: 'term' as Trimester, label: '37+ wks' },
]

export default function HealthStatusStep({
  formData,
  onUpdate,
}: HealthStatusStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary">Your health status</h2>
      <p className="text-text-secondary">I am currently…</p>

      <div className="grid grid-cols-2 gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onUpdate({ status: option.value, trimester: undefined })}
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
                onClick={() => onUpdate({ trimester: option.value })}
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
}
