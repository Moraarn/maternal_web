import { MapPin, Clock } from 'lucide-react'

interface Hospital {
  name: string
  distance: string
  hours: string
  services?: string
  mapsUrl: string
}

const hospitals: Hospital[] = [
  {
    name: 'Kibera Health Centre',
    distance: '0.8 km',
    hours: 'Open now',
    services: 'Maternity',
    mapsUrl: 'https://maps.google.com/?q=Kibera+Health+Centre+Nairobi'
  },
  {
    name: 'Mbagathi District Hosp.',
    distance: '3.4 km',
    hours: 'Open 24 hrs',
    mapsUrl: 'https://maps.google.com/?q=Mbagathi+District+Hospital+Nairobi'
  },
  {
    name: 'Kenyatta National Hosp.',
    distance: '5.2 km',
    hours: 'Open 24 hrs',
    services: 'Maternity wing',
    mapsUrl: 'https://maps.google.com/?q=Kenyatta+National+Hospital+Nairobi'
  }
]

export default function HospitalList() {
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase text-text-secondary font-medium">
        Nearest facilities
      </h3>
      
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
