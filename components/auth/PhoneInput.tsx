'use client'

import { useState } from 'react'
import ReactPhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  placeholder?: string
}

export default function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const [country, setCountry] = useState<string>('ke')
  const [error, setError] = useState<string | null>(null)

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '')
    // Allow reasonable phone length (10-15 digits for international numbers)
    return digitsOnly.length >= 10 && digitsOnly.length <= 15
  }

  const handleChange = (phone: string) => {
    // Limit total length to prevent infinite input
    if (phone.length > 20) {
      return
    }
    
    onChange(phone)
    
    // Validate and show error if invalid
    if (phone && !validatePhone(phone)) {
      setError('Please enter a valid phone number (10-15 digits)')
    } else {
      setError(null)
    }
  }

  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        country={country}
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? '7__ ___ ___'}
        preferredCountries={['ke', 'us', 'gb', 'de', 'fr']}
        enableAreaCodes={true}
        disableDropdown={false}
        countryCodeEditable={false}
        inputProps={{
          maxLength: 20,
          style: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          }
        }}
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
