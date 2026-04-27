import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusBarProps {
  title: string
  showBack?: boolean
  rightContent?: string
  color?: 'primary' | 'danger' | 'warning'
}

export default function StatusBar({ 
  title, 
  showBack = false, 
  rightContent,
  color = 'primary' 
}: StatusBarProps) {
  const router = useRouter()
  
  const getBackgroundColor = () => {
    switch (color) {
      case 'danger':
        return 'var(--color-danger)'
      case 'warning':
        return 'var(--color-warning)'
      default:
        return 'var(--color-primary)'
    }
  }
  
  return (
    <div 
      className="status-bar"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {showBack && (
        <button 
          onClick={() => router.back()}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="flex-1 text-center">
        <h1 className="text-white font-medium">{title}</h1>
      </div>
      <div className="text-white text-sm">
        {rightContent}
      </div>
    </div>
  )
}
