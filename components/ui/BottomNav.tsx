'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Activity, MessageCircle, User } from 'lucide-react'

interface NavTab {
  id: string
  labelEn: string
  labelSw: string
  icon: React.ReactNode
  path: string
}

const navTabs: NavTab[] = [
  {
    id: 'check',
    labelEn: 'Check',
    labelSw: 'Angalia',
    icon: <Activity size={20} />,
    path: '/check'
  },
  {
    id: 'talk',
    labelEn: 'Talk',
    labelSw: 'Zungumza',
    icon: <MessageCircle size={20} />,
    path: '/talk'
  },
  {
    id: 'profile',
    labelEn: 'Profile',
    labelSw: 'Wasifu',
    icon: <User size={20} />,
    path: '/profile'
  }
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [language] = useState<'en' | 'sw'>('en')

  const handleTabClick = (tab: NavTab) => {
    router.push(tab.path)
  }

  return (
    <div className="bottom-nav">
      {navTabs.map((tab) => {
        const isActive = pathname === tab.path
        const label = language === 'sw' ? tab.labelSw : tab.labelEn
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className={isActive ? 'text-primary' : 'text-text-secondary'}>
              {tab.icon}
            </div>
            <span className="text-xs">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
