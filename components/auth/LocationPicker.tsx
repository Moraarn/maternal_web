'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, X } from 'lucide-react'

interface LocationPickerProps {
  locationValue: string
  showMap: boolean
  onLocationChange: (location: string) => void
  onMapToggle: (show: boolean) => void
  locationInputRef: React.RefObject<HTMLInputElement>
  mapContainerRef: React.RefObject<HTMLDivElement>
  mapRef: React.MutableRefObject<any>
  markerRef: React.MutableRefObject<any>
  geocoderRef: React.MutableRefObject<any>
}

export default function LocationPicker({
  locationValue,
  onLocationChange,
  locationInputRef,
  showMap,
  onMapToggle,
  mapContainerRef,
  mapRef,
  markerRef,
  geocoderRef,
}: LocationPickerProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (showMap && !mapLoaded) {
      loadGoogleMaps()
    }
  }, [showMap, mapLoaded])

  const loadGoogleMaps = async () => {
    try {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.onload = () => {
          setMapLoaded(true)
          initializeMap()
        }
        script.onerror = () => {
          setMapError('Failed to load Google Maps')
        }
        document.head.appendChild(script)
      } else {
        setMapLoaded(true)
        initializeMap()
      }
    } catch (error) {
      setMapError('Failed to load Google Maps')
    }
  }

  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container || !window.google) return

    const map = new window.google.maps.Map(container, {
      center: { lat: -1.2921, lng: 36.8219 }, // Nairobi default
      zoom: 13,
    })

    mapRef.current = map

    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
      position: { lat: -1.2921, lng: 36.8219 },
    })

    markerRef.current = marker

    const geocoder = new window.google.maps.Geocoder()
    geocoderRef.current = geocoder

    // Handle marker drag end
    marker.addListener('dragend', (event: any) => {
      const position = event.latLng
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          onLocationChange(results[0].formatted_address)
        }
      })
    })

    // Handle map click
    map.addListener('click', (event: any) => {
      const position = event.latLng
      marker.setPosition(position)
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          onLocationChange(results[0].formatted_address)
        }
      })
    })
  }

  const handleMapToggle = () => {
    onMapToggle(!showMap)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Your location
      </label>
      <div className="relative">
        <input
          ref={locationInputRef}
          type="text"
          defaultValue={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="e.g. Kibera, Nairobi"
          className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
          }}
          required
        />
        <button
          type="button"
          onClick={handleMapToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
          title="Pick location from map"
        >
          <MapPin size={20} />
        </button>
      </div>

      {showMap && (
        <div className="mt-4 relative">
          <button
            type="button"
            onClick={() => onMapToggle(false)}
            className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <X size={16} />
          </button>
          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-xl overflow-hidden border border-border"
          />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-sm text-text-secondary">{mapError}</p>
            </div>
          )}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-sm text-text-secondary">Loading map...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
