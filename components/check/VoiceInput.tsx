import { Mic } from 'lucide-react'

interface VoiceInputProps {
  isRecording: boolean
  transcript: string
  onVoiceInput: () => void
}

export default function VoiceInput({ 
  isRecording, 
  transcript, 
  onVoiceInput 
}: VoiceInputProps) {
  return (
    <button
      onClick={onVoiceInput}
      className="w-full p-3 rounded-xl border border-border transition-colors flex items-center gap-3 hover:bg-opacity-5"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)'
        e.currentTarget.style.opacity = '0.05'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-background)'
        e.currentTarget.style.opacity = '1'
      }}
    >
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isRecording ? 'animate-pulse-ring' : ''
        }`}
        style={{
          backgroundColor: isRecording 
            ? 'var(--color-danger)' 
            : 'var(--color-primary)'
        }}
      >
        <Mic size={16} className="text-white" />
      </div>
      <span 
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {isRecording 
          ? 'Listening… speak your answer now' 
          : transcript 
            ? 'Voice answer recorded — tap to change'
            : 'Tap to answer by voice — speak in any language'
        }
      </span>
    </button>
  )
}
