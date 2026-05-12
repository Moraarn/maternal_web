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
          onChange={(e) => onUpdate({ chwName: e.target.value })}
          placeholder="e.g. Nurse Fatuma Wanjiku"
          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Health worker's phone
        </label>
        <PhoneInput
          value={formData.chwPhone ?? ''}
          onChange={(fullNumber) => onUpdate({ chwPhone: fullNumber })}
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
          onChange={(e) => onUpdate({ emergencyContactName: e.target.value })}
          placeholder="e.g. Margaret (sister)"
          className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
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
