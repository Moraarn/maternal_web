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

  const handleChange = (phone: string) => {
    onChange(phone)
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
          style: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
          }
        }}
      />
    </div>
  )
}
