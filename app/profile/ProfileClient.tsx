'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { user, lastCheckup, checkupHistory, logout } = useStore()
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHasHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hasHydrated && !user) router.push('/auth')
  }, [user, router, hasHydrated])

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

  const handleLogout = () => {
    if (logout) logout()
    router.push('/auth')
  }

  const riskStyle = (level: string) => {
    if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: '#EF4444' }
    if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: '#F59E0B' }
    return                         { bg: 'var(--color-green-light)', color: '#16A34A', dot: '#22C55E' }
  }

  const lc = lastCheckup ? riskStyle(lastCheckup.riskLevel) : null

  return (
    <div className="profile-root">
      {/* ── Hero ── */}
      <HeroSection user={user} />

      {/* ── Floating Checkup Card ── */}
      {lastCheckup && lc && <CheckupCard lastCheckup={lastCheckup} />}

      {/* ── Stats Row ── */}
      <StatsRow checkupHistory={checkupHistory} user={user} />

      {/* ── Accordions ── */}
      <div className="accordions-wrap">
        <ContactAccordion user={user} />
        <HistoryAccordion checkupHistory={checkupHistory} />
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
