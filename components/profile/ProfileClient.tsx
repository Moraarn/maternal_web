'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserProfile, UserProfile } from '@/app/profile/actions'
import { fetchCurrentUser } from '@/lib/auth'
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
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch user from backend
        const currentUser = await fetchCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }
        setUser(currentUser)

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
          router.push('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [router])

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
            onClick={() => window.location.reload()}
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

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    router.push('/auth')
  }

  const handleSaveProfile = async (updatedUser: any) => {
    // TODO: Save to backend API
    console.log('Saving profile:', updatedUser)
    setUser(updatedUser)
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  )
}
