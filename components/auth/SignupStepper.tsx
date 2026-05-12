'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { UserStatus, Trimester } from '@/store/useStore'
import { useAuth } from '@/hooks/useAuth'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'

interface SignupStepperProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

interface RegisterData {
  fullName: string
  phone: string
  location: string
  password: string
  status: UserStatus
  trimester?: Trimester
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export default function SignupStepper({ onSwitchToLogin, onSuccess }: SignupStepperProps) {
  const router = useRouter()
  const { signup, isLoading: authLoading, error: authError, clearError } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    phone: '',
    location: '',
    password: '',
    status: 'unknown',
    trimester: undefined,
    chwName: '',
    chwPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  const locationInputRef = useRef<HTMLInputElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const [showMap, setShowMap] = useState(false)

  const initializeGoogleMapsScript = () => {
    return loadGoogleMaps()
  }

  // Initialize autocomplete on mount
  useEffect(() => {
    const input = locationInputRef.current
    if (!input) return

    initializeGoogleMapsScript()
      .then(() => {
        const win = window as any
        if (win.google && win.google.maps && win.google.maps.places) {
          const autocomplete = new win.google.maps.places.Autocomplete(input, {
            types: ['geocode'],
          })
          autocomplete.setFields(['formatted_address', 'geometry', 'address_components', 'name'])
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.formatted_address) {
              updateFormData({ location: place.formatted_address })
              if (locationInputRef.current) {
                locationInputRef.current.value = place.formatted_address
              }
            }
          })
        }
      })
      .catch((err) => console.error('Autocomplete init failed:', err))
  }, [])

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return

    initializeGoogleMapsScript()
      .then(() => {
        const win = window as any
        if (!(win.google && win.google.maps)) {
          console.error('Google Maps not available')
          return
        }

        if (!geocoderRef.current) {
          geocoderRef.current = new win.google.maps.Geocoder()
        }

        // initialize map if not present
        if (mapRef.current) return

        const defaultCenter = { lat: -1.286389, lng: 36.817223 }
        mapRef.current = new win.google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
        })

        // try to center on user's location if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
              mapRef.current?.setCenter(c)
            },
            () => {
              // ignore errors
            },
          )
        }

        // click listener to place marker and reverse-geocode
        mapRef.current.addListener('click', (e: any) => {
          const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          if (markerRef.current) {
            markerRef.current.setPosition(e.latLng)
          } else {
            markerRef.current = new win.google.maps.Marker({ position: e.latLng, map: mapRef.current })
          }

          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: latLng }, (results: any, status: any) => {
              if (status === win.google.maps.GeocoderStatus.OK && results && results[0]) {
                const addr = results[0].formatted_address
                updateFormData({ location: addr })
                // also update input value
                if (locationInputRef.current) {
                  locationInputRef.current.value = addr
                }
                setShowMap(false)
              } else {
                console.warn('Geocode failed:', status)
              }
            })
          }
        })
      })
      .catch((err) => console.error('Map initialization failed:', err))

    return () => {
      // do not destroy the map instance; allow it to be reused
    }
  }, [showMap])

  const updateFormData = (updates: Partial<RegisterData>) => {
    setFormData((prev: RegisterData) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) {
      console.log('Already submitted or loading, ignoring duplicate submission')
      return
    }
    
    setIsLoading(true)
    setIsSubmitted(true)
    setError(null)
    clearError()
    
    try {
      const result = await signup(formData)
      
      if (result.success) {
        console.log('Registration successful, redirecting to home')
        onSuccess()
        router.push('/home')
      } else {
        setError(result.error || 'Registration failed')
        setIsLoading(false)
        setIsSubmitted(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setIsLoading(false)
      setIsSubmitted(false)
    }
  }

  const nextStep = () => {
    if (isLoading || isSubmitted) {
      console.log('Already submitting or submitted, ignoring click')
      return
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const statusOptions = [
    {
      value: 'pregnant' as UserStatus,
      emoji: '🤰',
      label: 'Pregnant',
      subtitle: 'Currently expecting'
    },
    {
      value: 'postpartum_early' as UserStatus,
      emoji: '👶',
      label: 'New mama',
      subtitle: 'Gave birth recently (0–6 wks)'
    },
    {
      value: 'postpartum_late' as UserStatus,
      emoji: '🌸',
      label: 'Recovering',
      subtitle: 'Birth was 6–12 weeks ago'
    },
    {
      value: 'unknown' as UserStatus,
      emoji: '❓',
      label: 'Not sure',
      subtitle: "I'll check both"
    }
  ]

  const trimesterOptions = [
    { value: 'first' as Trimester, label: '1–12 wks' },
    { value: 'second' as Trimester, label: '13–26 wks' },
    { value: 'third' as Trimester, label: '27–36 wks' },
    { value: 'term' as Trimester, label: '37+ wks' }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Your details</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData({ fullName: e.target.value })}
                placeholder="e.g. Amina Wanjiru"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Your location
              </label>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  placeholder="e.g. Kibera, Nairobi"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  aria-label="Pick location on map"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-md shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>

              {/* Map modal */}
              {showMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowMap(false)} />
                  <div className="relative w-[90%] max-w-2xl h-[60vh] bg-white rounded-lg overflow-hidden shadow-lg">
                    <div ref={mapContainerRef} className="w-full h-full" />
                    <button
                      onClick={() => setShowMap(false)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow"
                      aria-label="Close map"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Create a password
                <span className="text-text-secondary font-normal"> (min. 6 characters)</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Your health status</h2>
            <p className="text-text-secondary">I am currently…</p>
            
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFormData({ status: option.value, trimester: undefined })}
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
                      onClick={() => updateFormData({ trimester: option.value })}
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
        
      case 3:
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
                onChange={(e) => updateFormData({ chwName: e.target.value })}
                placeholder="e.g. Nurse Fatuma Wanjiku"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Health worker's phone
              </label>
              <input
                type="tel"
                value={formData.chwPhone}
                onChange={(e) => updateFormData({ chwPhone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                placeholder="e.g. Margaret (sister)"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emergency contact phone
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                placeholder="+254 7__ ___ ___"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.phone && formData.location && formData.password.length >= 6
      case 2:
        return formData.status !== 'unknown' && (formData.status !== 'pregnant' || formData.trimester)
      case 3:
        return formData.phone // Phone is required for registration
      default:
        return false
    }
  }

  return (
    <div>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-2 transition-all ${
              step === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
            } rounded-full`}
          />
        ))}
      </div>
      
      {renderStep()}
      
      {error && (
        <div className="text-red-500 text-sm mt-4">{error}</div>
      )}
      
      <div className="flex gap-3 mt-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
          >
            ← Back
          </Button>
        )}
        
        <Button
          type="button"
          onClick={nextStep}
          disabled={!canProceed() || isLoading || isSubmitted}
          className="flex-1"
        >
          {isLoading ? 'Creating account...' : currentStep === 3 ? 'Create my account' : 'Continue →'}
        </Button>
      </div>
      
      {currentStep === 1 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      )}
    </div>
  )
}