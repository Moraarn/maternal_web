'use client'

import PhoneInput from './PhoneInput'
import { RegisterData } from '../../lib/types'

interface CareTeamStepProps {
  formData: RegisterData
  onUpdate: (updates: Partial<RegisterData>) => void
}

export default function CareTeamStep({ formData, onUpdate }: CareTeamStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        This helps us alert the right people in an emergency
      </p>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Health worker's name
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}> (optional)</span>
        </label>
        <input
          type="text"
          value={formData.chwName}
          onChange={(e) => onUpdate({ chwName: e.target.value })}
          placeholder="e.g. Nurse Fatuma Wanjiku"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Health worker's phone
        </label>
        <PhoneInput
          value={formData.chwPhone ?? ''}
          onChange={(fullNumber) => onUpdate({ chwPhone: fullNumber })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Emergency contact name
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}> (optional)</span>
        </label>
        <input
          type="text"
          value={formData.emergencyContactName}
          onChange={(e) => onUpdate({ emergencyContactName: e.target.value })}
          placeholder="e.g. Margaret (sister)"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Emergency contact phone
        </label>
        <PhoneInput
          value={formData.emergencyContactPhone ?? ''}
          onChange={(fullNumber) => onUpdate({ emergencyContactPhone: fullNumber })}
        />
      </div>
    </div>
  )
}
