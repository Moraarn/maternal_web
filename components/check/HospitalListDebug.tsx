'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Star, Loader2 } from 'lucide-react'
import { LocationService, GoogleMapsService, Hospital } from '@/lib/location'

export default function HospitalListDebug() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const loadNearbyHospitals = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🏥 DEBUG: Starting hospital location search...')
        setDebugInfo(prev => ({ ...prev, step: 'Starting search' }))
        
        // Check API key first
        const apiKey = GoogleMapsService.getApiKey()
        setDebugInfo(prev => ({ ...prev, apiKey: apiKey ? 'Set' : 'Not set' }))
        
        // Get user's current location
        const location = await LocationService.getCurrentLocation()
        console.log('📍 DEBUG: Location obtained:', location)
        setDebugInfo(prev => ({ ...prev, location }))
        
        // Load Google Maps script
        await GoogleMapsService.loadGoogleMapsScript()
        console.log('🗺️ DEBUG: Google Maps script loaded')
        setDebugInfo(prev => ({ ...prev, scriptLoaded: true }))
        
        // Find nearby hospitals
        const nearbyHospitals = await GoogleMapsService.findNearbyHospitals(location)
        console.log('🏥 DEBUG: Nearby hospitals found:', nearbyHospitals)
        setDebugInfo(prev => ({ ...prev, hospitalsFound: nearbyHospitals.length }))
        
        if (nearbyHospitals.length === 0) {
          console.log('❌ DEBUG: No hospitals found nearby')
          setError('No hospitals found nearby')
        } else {
          console.log('✅ DEBUG: Setting hospitals:', nearbyHospitals)
          setHospitals(nearbyHospitals)
        }
      } catch (err) {
        console.error('❌ DEBUG: Error loading hospitals:', err)
        setDebugInfo(prev => ({ ...prev, error: err.message }))
        if (err instanceof GeolocationPositionError) {
          setError('Location access denied. Please enable location services.')
        } else {
          setError('Unable to load nearby hospitals')
        }
      } finally {
        setLoading(false)
      }
    }

    loadNearbyHospitals()
  }, [])

  console.log('🏥 DEBUG: HospitalList render state:', { loading, error, hospitalsCount: hospitals.length })

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase text-text-secondary font-medium">
        Nearest facilities (DEBUG)
      </h3>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-2 rounded text-xs">
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>Hospitals:</strong> {hospitals.length}</div>
        <div><strong>Debug Info:</strong></div>
        <pre className="text-xs bg-white p-1 rounded mt-1">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-2">
        {hospitals.map((hospital, index) => (
          <div
            key={index}
            className="bg-white border border-border rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-green-light rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-text-primary truncate">
                {hospital.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>{hospital.distance}</span>
                <span>•</span>
                <span>{hospital.hours}</span>
                {hospital.services && (
                  <>
                    <span>•</span>
                    <span>{hospital.services}</span>
                  </>
                )}
                {hospital.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span>{hospital.rating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={() => window.open(hospital.mapsUrl, '_blank')}
              className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Go
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
