'use client'

import { ReactNode } from 'react'
import StatusBar from './StatusBar'
import BottomNav from './BottomNav'

interface AppShellProps {
  children: ReactNode
  statusBar?: {
    title: string
    showBack?: boolean
    rightContent?: string
    color?: 'primary' | 'danger' | 'warning'
  }
  showBottomNav?: boolean
}

export default function AppShell({ 
  children, 
  statusBar, 
  showBottomNav = true 
}: AppShellProps) {
  return (
    <div className="phone-container flex flex-col">
      {statusBar && (
        <StatusBar
          title={statusBar.title}
          showBack={statusBar.showBack}
          rightContent={statusBar.rightContent}
          color={statusBar.color}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  )
}
