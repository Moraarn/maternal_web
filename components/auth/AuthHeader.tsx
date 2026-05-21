'use client'

import { Users } from 'lucide-react'

interface AuthHeaderProps {
  onSignIn?: () => void
  onCreateAccount?: () => void
  activeTab?: 'signin' | 'signup'
}

export default function AuthHeader({ onSignIn, onCreateAccount, activeTab = 'signin' }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Logo and Brand */}
      <div className="flex flex-col items-center mb-8">
        {/* Logo Circle */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: '#059669' }}
        >
          <Users size={32} className="text-white" />
        </div>
        
        {/* App Name */}
        <h1 
          className="text-3xl font-bold mb-1"
          style={{ color: '#1f2937' }}
        >
          CystaNiva
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-sm"
          style={{ color: '#6b7280' }}
        >
          Maternal health risk checker
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onSignIn}
          className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
            activeTab === 'signin' ? 'text-white' : 'text-gray-700'
          }`}
          style={{
            backgroundColor: activeTab === 'signin' ? '#059669' : 'white',
            border: activeTab === 'signin' ? 'none' : '1px solid #e5e7eb'
          }}
        >
          Sign in
        </button>
        <button
          onClick={onCreateAccount}
          className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
            activeTab === 'signup' ? 'text-white' : 'text-gray-700'
          }`}
          style={{
            backgroundColor: activeTab === 'signup' ? '#059669' : 'white',
            border: activeTab === 'signup' ? 'none' : '1px solid #e5e7eb'
          }}
        >
          Create account
        </button>
      </div>
    </div>
  )
}
