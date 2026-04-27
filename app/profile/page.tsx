'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import AppShell from '@/components/ui/AppShell'
import Button from '@/components/ui/Button'
import CollapsibleSection from '@/components/ui/CollapsibleSection'
import EditProfileModal from '@/components/profile/EditProfileModal'
import SettingsModal from '@/components/profile/SettingsModal'
import { User, Calendar, Phone, MapPin, Baby, Activity, Clock, ChevronRight, Settings, Palette, Globe } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, lastCheckup, checkupHistory } = useStore()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  useEffect(() => {
    // Simple hydration check
    const timer = setTimeout(() => {
      setHasHydrated(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Redirect to auth if not authenticated after hydration
    if (hasHydrated && !user) {
      router.push('/auth')
      return
    }
  }, [user, router, hasHydrated])

  // Show loading state while hydrating
  if (!hasHydrated || !user) {
    return (
      <AppShell
        statusBar={{
          title: 'Loading...',
          showBack: true,
          rightContent: '',
          color: 'primary'
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pregnant': return '🤰'
      case 'postpartum_early': return '👶'
      case 'postpartum_late': return '🌸'
      default: return '❓'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pregnant': return 'Pregnant'
      case 'postpartum_early': return 'New Mama (0-6 weeks)'
      case 'postpartum_late': return 'Recovering (6-12 weeks)'
      default: return 'Unknown'
    }
  }

  const getTrimesterLabel = (trimester?: string) => {
    if (!trimester) return ''
    switch (trimester) {
      case 'first': return '1st Trimester (1-12 weeks)'
      case 'second': return '2nd Trimester (13-26 weeks)'
      case 'third': return '3rd Trimester (27-36 weeks)'
      case 'term': return 'Term (37+ weeks)'
      default: return ''
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-danger bg-red-light'
      case 'medium': return 'text-warning bg-yellow-light'
      default: return 'text-primary bg-green-light'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AppShell
      statusBar={{
        title: t('profile.title'),
        showBack: true,
        rightContent: '',
        color: 'primary'
      }}
    >
      <div className="flex-1 overflow-y-auto">
        {/* User Info Section */}
        <div 
          className="p-6"
          style={{
            background: `linear-gradient(to bottom, var(--color-primary), var(--color-primary-dark))`,
            color: 'white'
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p style={{ opacity: 0.8 }}>{user.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getStatusEmoji(user.status)}</span>
            <span className="font-medium">{getStatusLabel(user.status)}</span>
          </div>
          
          {user.trimester && (
            <p className="text-sm" style={{ opacity: 0.8 }}>{getTrimesterLabel(user.trimester)}</p>
          )}
        </div>

        {/* Quick Stats */}
        {lastCheckup && (
          <div 
            className="border-b p-4"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Last Checkup</p>
                <p className="font-medium">{formatDate(lastCheckup.date)}</p>
                <p className="text-sm text-text-secondary">{formatTime(lastCheckup.date)}</p>
              </div>
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: lastCheckup.riskLevel === 'high' 
                    ? 'var(--color-red-light)' 
                    : lastCheckup.riskLevel === 'medium'
                    ? 'var(--color-yellow-light)'
                    : 'var(--color-green-light)',
                  color: lastCheckup.riskLevel === 'high' 
                    ? 'var(--color-red-dark)' 
                    : lastCheckup.riskLevel === 'medium'
                    ? 'var(--color-yellow-dark)'
                    : 'var(--color-green-dark)'
                }}
              >
                {lastCheckup.riskLevel.toUpperCase()} RISK
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <CollapsibleSection 
          title={t('profile.contactInfo')}
          icon={<Phone size={20} className="text-text-secondary" />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">{t('profile.phone')}</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">{t('profile.location')}</p>
                <p className="font-medium">{user.location || 'Not set'}</p>
              </div>
            </div>
            
            {user.chwName && (
              <div className="flex items-center gap-3">
                <Baby size={20} className="text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">{t('profile.chw')}</p>
                  <p className="font-medium">{user.chwName}</p>
                  <p className="text-sm text-text-secondary">{user.chwPhone}</p>
                </div>
              </div>
            )}
            
            {user.emergencyContactName && (
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-text-secondary" />
                <div>
                  <p className="text-sm text-text-secondary">{t('profile.emergencyContact')}</p>
                  <p className="font-medium">{user.emergencyContactName}</p>
                  <p className="text-sm text-text-secondary">{user.emergencyContactPhone}</p>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Checkup History */}
        <CollapsibleSection 
          title={t('profile.checkupHistory')}
          icon={<Activity size={20} className="text-text-secondary" />}
          defaultOpen={false}
        >
          {checkupHistory.length > 0 ? (
            <div className="space-y-3">
              {checkupHistory.map((checkup, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-text-secondary" />
                    <div>
                      <p className="font-medium text-sm">{formatDate(checkup.date)}</p>
                      <p className="text-xs text-text-secondary">{formatTime(checkup.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: checkup.riskLevel === 'high' 
                          ? 'var(--color-red-light)' 
                          : checkup.riskLevel === 'medium'
                          ? 'var(--color-yellow-light)'
                          : 'var(--color-green-light)',
                        color: checkup.riskLevel === 'high' 
                          ? 'var(--color-red-dark)' 
                          : checkup.riskLevel === 'medium'
                          ? 'var(--color-yellow-dark)'
                          : 'var(--color-green-dark)'
                      }}
                    >
                      {checkup.riskLevel}
                    </span>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock size={32} className="text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">{t('profile.noHistory')}</p>
              <p className="text-sm text-text-secondary mt-1">{t('profile.noHistoryText')}</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Action Buttons */}
        <div 
          className="p-4 border-t space-y-3"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)'
          }}
        >
          <Button
            onClick={() => router.push('/home')}
            fullWidth
          >
            {t('profile.startCheckup')}
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1"
            >
              {t('profile.edit')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex-1"
            >
              <Settings size={16} className="mr-1" />
              {t('settings.theme')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </AppShell>
  )
}