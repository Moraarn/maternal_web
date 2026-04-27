'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { UserStatus, Trimester } from '@/store/useStore'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setUser } = useStore()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    status: 'unknown' as UserStatus,
    trimester: undefined as Trimester | undefined,
    chwName: '',
    chwPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        location: user.location || '',
        status: user.status || 'unknown',
        trimester: user.trimester || undefined,
        chwName: user.chwName || '',
        chwPhone: user.chwPhone || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    
    try {
      // Update user in store
      const updatedUser = {
        ...user,
        ...formData
      }
      
      setUser(updatedUser)
      
      // TODO: Save to backend API
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      onClose()
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'pregnant' as UserStatus, label: '🤰 Pregnant', subtitle: 'Currently expecting' },
    { value: 'postpartum_early' as UserStatus, label: '👶 New Mama', subtitle: 'Gave birth recently (0–6 wks)' },
    { value: 'postpartum_late' as UserStatus, label: '🌸 Recovering', subtitle: 'Birth was 6–12 weeks ago' },
    { value: 'unknown' as UserStatus, label: '❓ Not sure', subtitle: "I'll check both" }
  ]

  const trimesterOptions = [
    { value: 'first' as Trimester, label: '1st Trimester (1-12 weeks)' },
    { value: 'second' as Trimester, label: '2nd Trimester (13-26 weeks)' },
    { value: 'third' as Trimester, label: '3rd Trimester (27-36 weeks)' },
    { value: 'term' as Trimester, label: 'Term (37+ weeks)' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+254 7__ ___ ___"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your location"
              />
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Health Status</h3>
          
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={formData.status === option.value}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-text-primary">{option.label}</div>
                  <div className="text-sm text-text-secondary">{option.subtitle}</div>
                </div>
              </label>
            ))}
          </div>

          {formData.status === 'pregnant' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Trimester
              </label>
              <select
                value={formData.trimester || ''}
                onChange={(e) => handleInputChange('trimester', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select trimester</option>
                {trimesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Emergency Contacts</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Community Health Worker Name
              </label>
              <input
                type="text"
                value={formData.chwName}
                onChange={(e) => handleInputChange('chwName', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="CHW name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                CHW Phone Number
              </label>
              <input
                type="tel"
                value={formData.chwPhone}
                onChange={(e) => handleInputChange('chwPhone', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="CHW phone (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Emergency contact name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Emergency contact phone (optional)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
