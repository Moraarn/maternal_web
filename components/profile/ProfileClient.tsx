'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserProfile, UserProfile } from '@/app/profile/actions'
import { getCurrentUser } from '@/app/auth/actions'
import HeroSection from '@/components/profile/HeroSection'
import CheckupCard from '@/components/profile/CheckupCard'
import StatsRow from '@/components/profile/StatsRow'
import ContactAccordion from '@/components/profile/ContactAccordion'
import HistoryAccordion from '@/components/profile/HistoryAccordion'
import ActionButtons from '@/components/profile/ActionButtons'
import LogoutSheet from '@/components/profile/LogoutSheet'
import EditProfileModal from '@/components/profile/EditProfileModal'
import SettingsModal from '@/components/profile/SettingsModal'

export default function ProfileClient() {
  const router = useRouter()
  const { user, logout } = useStore()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setHasHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hasHydrated && !user) router.push('/auth')
  }, [user, router, hasHydrated])

  useEffect(() => {
    if (hasHydrated && user) {
      fetchUserProfile()
    }
  }, [hasHydrated, user])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validate authentication using getCurrentUser
      const userResponse = await getCurrentUser()
      if (!userResponse.success || !userResponse.body) {
        console.log('🚫 [ProfileClient] Invalid authentication, redirecting to auth')
        logout()
        router.push('/auth')
        return
      }
      
      const profile = await getUserProfile()
      console.log('📊 [ProfileClient] Profile data received:', {
        profile,
        hasCheckHistory: !!profile.checkHistory,
        checkHistoryLength: profile.checkHistory?.length || 0,
        checkHistorySample: profile.checkHistory?.slice(0, 2),
        hasLastCheckResult: !!profile.lastCheckResult
      })
      setUserProfile(profile)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load profile data')
      // If it's a 401 error, redirect to auth
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
        logout()
        router.push('/auth')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!hasHydrated || !user) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Loading profile…</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Loading profile data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchUserProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    if (logout) logout()
    router.push('/auth')
  }

  const riskStyle = (level: string) => {
    if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: '#EF4444' }
    if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: '#F59E0B' }
    return                         { bg: 'var(--color-green-light)', color: '#16A34A', dot: '#22C55E' }
  }

  const lc = userProfile?.lastCheckResult ? riskStyle(userProfile.lastCheckResult.riskLevel) : null

  return (
    <div className="profile-root">
      {/* ── Hero ── */}
      <HeroSection user={user} />

      {/* ── Floating Checkup Card ── */}
      {userProfile?.lastCheckResult && lc && <CheckupCard lastCheckup={userProfile.lastCheckResult} />}

      {/* ── Stats Row ── */}
      <StatsRow checkupHistory={userProfile?.checkHistory || []} user={user} />

      {/* ── Accordions ── */}
      <div className="accordions-wrap">
        <ContactAccordion user={user} />
        <HistoryAccordion checkupHistory={userProfile?.checkHistory || []} />
      </div>

      {/* ── Actions ── */}
      <ActionButtons
        onStartCheckup={() => router.push('/home')}
        onEditProfile={() => setIsEditModalOpen(true)}
        onSettings={() => setIsSettingsModalOpen(true)}
        onLogout={() => setShowLogoutConfirm(true)}
        t={t}
      />

      {/* ── Logout Sheet ── */}
      <LogoutSheet
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  )
}
