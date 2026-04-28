import AppShell from '@/components/ui/AppShell'
import ProfileClient from '../../components/profile/ProfileClient'

export default function ProfilePage() {
  return (
    <AppShell statusBar={{ title: 'My Profile', showBack: true, rightContent: '', color: 'primary' }}>
      <ProfileClient />
    </AppShell>
  )
}