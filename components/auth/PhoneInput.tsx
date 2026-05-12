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

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)
  }

  return (
    <div className="phone-input-wrapper">
      <ReactPhoneInput
        country={country}
        value={value}
        onChange={handleChange}
        onCountryChange={handleCountryChange}
        placeholder={placeholder ?? '7__ ___ ___'}
        preferredCountries={['ke', 'us', 'gb', 'de', 'fr']}
        enableAreaCodes={true}
        disableDropdown={false}
        countryCodeEditable={false}
        inputProps={{
          className:
            'flex-1 px-4 py-3 border border-border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
        }}
      />
      <style jsx>{`
        :global(.react-tel-input .flag-dropdown) {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.75rem 0 0 0.75rem;
          background-color: #f9fafb;
        }

        :global(.react-tel-input .flag-dropdown:hover) {
          background-color: #f3f4f6;
        }

        :global(.react-tel-input .flag-dropdown.open) {
          background-color: #f3f4f6;
        }

        :global(.react-tel-input .selected-flag) {
          padding: 0 0.5rem;
        }

        :global(.react-tel-input .flag) {
          margin-right: 0.5rem;
        }

        :global(.react-tel-input .country-list) {
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        :global(.react-tel-input .country-list .country) {
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
        }

        :global(.react-tel-input .country-list .country:hover) {
          background-color: #f9fafb;
        }

        :global(.react-tel-input .country-list .country.highlight) {
          background-color: #dcfce7;
        }

        :global(.react-tel-input input) {
          border: 1px solid var(--border-color, #e5e7eb);
          border-left: none;
          border-radius: 0 0.75rem 0.75rem 0;
          padding: 0.75rem 1rem;
        }

        :global(.react-tel-input input:focus) {
          outline: none;
          ring: 2px;
          ring-color: var(--primary-color, #10b981);
          border-color: transparent;
        }

        :global(.react-tel-input) {
          display: flex;
          gap: 0;
        }
      `}</style>
    </div>
  )
}
