'use client'

import { useEffect } from 'react'

interface GoogleMapsLoaderProps {
  children: React.ReactNode
}

export default function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  useEffect(() => {
    const loadGoogleMapsScript = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('Google Maps API key is not configured')
        return
      }

      // Check if script is already loaded
      if (window.google && window.google.maps) {
        return
      }

      const script = document.createElement('script')
      script.async = true
      script.defer = true
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      
      script.onload = () => {
        console.log('Google Maps script loaded successfully')
      }
      
      script.onerror = () => {
        console.error('Failed to load Google Maps script')
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  return <>{children}</>
}
