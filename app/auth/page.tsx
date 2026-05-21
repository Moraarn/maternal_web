import AuthClient from '@/components/auth/AuthClient'
import AuthHeader from '@/components/auth/AuthHeader'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthClient initialUser={null} />
    </div>
  )
}