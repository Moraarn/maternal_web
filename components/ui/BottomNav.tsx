'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Activity, MessageCircle, User } from 'lucide-react'

interface NavTab {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const navTabs: NavTab[] = [
  {
    id: 'check',
    label: 'Check',
    icon: <Activity size={20} />,
    path: '/check'
  },
  {
    id: 'talk',
    label: 'Talk',
    icon: <MessageCircle size={20} />,
    path: '/talk'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User size={20} />,
    path: '/profile'
  }
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  
  const handleTabClick = (tab: NavTab) => {
    router.push(tab.path)
  }
  
  return (
    <div className="bottom-nav">
      {navTabs.map((tab) => {
        const isActive = pathname === tab.path
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`nav-tab ${isActive ? 'active' : ''}`}
          >
            <div className={isActive ? 'text-primary' : 'text-text-secondary'}>
              {tab.icon}
            </div>
            <span className="text-xs">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
