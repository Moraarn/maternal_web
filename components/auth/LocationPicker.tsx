'use client'

interface LocationPickerProps {
  locationValue: string
  showMap: boolean
  onLocationChange: (location: string) => void
  onMapToggle: (show: boolean) => void
  locationInputRef: React.RefObject<HTMLInputElement | null>
  mapContainerRef: React.RefObject<HTMLDivElement | null>
  mapRef: React.MutableRefObject<any>
  markerRef: React.MutableRefObject<any>
  geocoderRef: React.MutableRefObject<any>
}

export default function LocationPicker({
  locationValue,
  onLocationChange,
  locationInputRef,
}: LocationPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        Your location
      </label>
      <input
        ref={locationInputRef}
        type="text"
        defaultValue={locationValue}
        onChange={(e) => onLocationChange(e.target.value)}
        placeholder="e.g. Kibera, Nairobi"
        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        required
      />
    </div>
  )
}
