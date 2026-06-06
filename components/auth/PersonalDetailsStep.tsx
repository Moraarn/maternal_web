'use client'

import { useRef } from 'react'
import LocationPicker from './LocationPicker'
import PhoneInput from './PhoneInput'
import { RegisterData } from '../../lib/types'

interface PersonalDetailsStepProps {
  formData: RegisterData
  showMap: boolean
  onUpdate: (updates: Partial<RegisterData>) => void
  onMapToggle: (show: boolean) => void
  locationInputRef: React.RefObject<HTMLInputElement>
  mapContainerRef: React.RefObject<HTMLDivElement>
  mapRef: React.MutableRefObject<any>
  markerRef: React.MutableRefObject<any>
  geocoderRef: React.MutableRefObject<any>
}

export default function PersonalDetailsStep({
  formData,
  showMap,
  onUpdate,
  onMapToggle,
  locationInputRef,
  mapContainerRef,
  mapRef,
  markerRef,
  geocoderRef,
}: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Full name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => onUpdate({ fullName: e.target.value })}
          placeholder="e.g. Amina Wanjiru"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Phone number
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={(fullNumber) => onUpdate({ phone: fullNumber })}
        />
      </div>

      <LocationPicker
        locationValue={formData.location}
        showMap={showMap}
        onLocationChange={(location) => onUpdate({ location })}
        onMapToggle={onMapToggle}
        locationInputRef={locationInputRef}
        mapContainerRef={mapContainerRef}
        mapRef={mapRef}
        markerRef={markerRef}
        geocoderRef={geocoderRef}
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Create a password
          <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}> (min. 6 characters)</span>
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => onUpdate({ password: e.target.value })}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
          required
          minLength={6}
        />
      </div>
    </div>
  )
}
