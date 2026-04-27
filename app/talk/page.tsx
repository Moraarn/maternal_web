'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import AppShell from '@/components/ui/AppShell'
import ChatBubble from '@/components/talk/ChatBubble'
import TypingIndicator from '@/components/talk/TypingIndicator'
import MicButton from '@/components/talk/MicButton'
import CallUI from '@/components/talk/CallUI'
import { Send, Phone } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export default function TalkPage() {
  const router = useRouter()
  const { user, lastCheckup } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  
  // Call state
  const [isInCall, setIsInCall] = useState(false)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isAIResponding, setIsAIResponding] = useState(false)
  const [callDuration, setCallDuration] = useState('00:00')
  const [conversationTurn, setConversationTurn] = useState<'user' | 'ai'>('user')
  
  // Voice hooks
  const { 
    isListening: isUserListening, 
    transcript: userTranscript, 
    isSupported: speechSupported,
    error: speechError,
    startListening: startUserListening,
    stopListening: stopUserListening,
    resetTranscript: resetUserTranscript
  } = useSpeechRecognition()
  
  const { 
    isSpeaking: isAISpeaking, 
    speak: speakAI, 
    stop: stopAISpeaking,
    isSupported: ttsSupported 
  } = useTextToSpeech()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Initialize with greeting
    const greeting: Message = {
      id: '1',
      text: "Hello! I am the Continuum health assistant. Tell me how you are feeling today — you can speak or type in any language.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([greeting])
  }, [user, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Call duration timer
  useEffect(() => {
    if (isInCall && callStartTime) {
      callIntervalRef.current = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTime.getTime()) / 1000)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }, 1000)
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
        callIntervalRef.current = null
      }
      setCallDuration('00:00')
    }

    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
      }
    }
  }, [isInCall, callStartTime])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getUserContext = () => {
    if (!user) return {}

    return {
      status: user.status,
      trimester: user.trimester,
      weeksCount: user.weeksCount,
      lastRiskLevel: lastCheckup?.riskLevel,
      lastSymptoms: lastCheckup?.symptomsDetected || [],
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-10), // Send last 10 messages for context
          userContext: getUserContext()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      setIsTyping(false)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])

      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedText += parsed.content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessage.id 
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again or contact your health worker if you need immediate help.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      if (transcript.trim()) {
        sendMessage(transcript)
        setTranscript('')
      }
    } else {
      // Start recording
      setIsRecording(true)
      setTranscript('')
      
      // TODO: Implement Web Speech API
      // For now, simulate voice input
      setTimeout(() => {
        const simulatedTranscripts = [
          "I have been having headaches lately",
          "I feel dizzy when I stand up",
          "I have some swelling in my hands",
          "I'm feeling fine today"
        ]
        const randomTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)]
        setTranscript(randomTranscript)
        setIsRecording(false)
        sendMessage(randomTranscript)
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  // Handle voice input during call
  useEffect(() => {
    if (isInCall && conversationTurn === 'user' && userTranscript && !isAIResponding) {
      // Check if user has finished speaking (simple heuristic)
      const words = userTranscript.trim().split(' ')
      if (words.length > 3 && userTranscript.endsWith(' ') || 
          words.length > 10) {
        handleUserSpeech(userTranscript.trim())
      }
    }
  }, [userTranscript, isInCall, conversationTurn, isAIResponding])

  const handleUserSpeech = async (userSpeech: string) => {
    if (!userSpeech.trim()) return
    
    // Stop listening
    stopUserListening()
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userSpeech,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMessage])
    
    // Reset transcript for next turn
    resetUserTranscript()
    
    // Get AI response
    setConversationTurn('ai')
    setIsAIResponding(true)
    
    try {
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userSpeech,
          history: messages.slice(-10),
          userContext: getUserContext()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.response || "I'm here to help. Can you tell me more about how you're feeling?"
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])
      
      // Speak AI response
      if (isSpeakerOn) {
        speakAI(aiResponse)
      }
      
      // Wait for speech to finish, then allow user to speak again
      const speechDuration = Math.max(2000, aiResponse.length * 50) // Estimate speech duration
      setTimeout(() => {
        setIsAIResponding(false)
        setConversationTurn('user')
        if (!isMuted && isInCall) {
          startUserListening()
        }
      }, isSpeakerOn ? speechDuration : 1000)
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response
      const fallbackResponse = "I'm having trouble connecting right now. Please try again or contact your health worker if you need immediate help."
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])
      
      if (isSpeakerOn) {
        speakAI(fallbackResponse)
      }
      
      setTimeout(() => {
        setIsAIResponding(false)
        setConversationTurn('user')
        if (!isMuted && isInCall) {
          startUserListening()
        }
      }, isSpeakerOn ? 3000 : 1000)
    }
  }

  // Call functions
  const startCall = () => {
    setIsInCall(true)
    setCallStartTime(new Date())
    setIsMuted(false)
    setIsSpeakerOn(true)
    setIsAIResponding(false)
    setConversationTurn('user')
    resetUserTranscript()
    
    // Start with AI greeting
    setTimeout(() => {
      handleAIGreeting()
    }, 1000)
  }

  const handleAIGreeting = async () => {
    setConversationTurn('ai')
    setIsAIResponding(true)
    
    const greeting = "Hello! I'm your CystaNiva health assistant. How are you feeling today? You can tell me about any symptoms or concerns you have."
    
    // Add greeting to messages
    const greetingMessage: Message = {
      id: Date.now().toString(),
      text: greeting,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, greetingMessage])
    
    // Speak the greeting
    if (isSpeakerOn) {
      speakAI(greeting)
    }
    
    // Wait for speech to finish, then allow user to speak
    setTimeout(() => {
      setIsAIResponding(false)
      setConversationTurn('user')
      if (!isMuted) {
        startUserListening()
      }
    }, isSpeakerOn ? 4000 : 2000)
  }

  const endCall = () => {
    stopUserListening()
    stopAISpeaking()
    setIsInCall(false)
    setCallStartTime(null)
    setIsMuted(false)
    setIsSpeakerOn(true)
    setIsAIResponding(false)
    setConversationTurn('user')
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (newMutedState) {
      stopUserListening()
    } else if (isInCall && conversationTurn === 'user' && !isAIResponding) {
      startUserListening()
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  return (
    <>
      {isInCall ? (
        <CallUI
          onEndCall={endCall}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isSpeakerOn={isSpeakerOn}
          onToggleSpeaker={toggleSpeaker}
          isAIResponding={isAIResponding}
          callDuration={callDuration}
          isUserListening={isUserListening}
          userTranscript={userTranscript}
          speechError={speechError}
          conversationTurn={conversationTurn}
        />
      ) : (
        <AppShell
          statusBar={{
            title: 'Talk to CystaNiva AI'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Voice Status Bar */}
            {isRecording && (
              <div 
                className="px-4 py-2 border-b"
                style={{
                  backgroundColor: 'var(--color-green-light)',
                  borderColor: 'var(--color-green-dark)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full animate-waveform"
                        style={{ 
                          height: `${8 + Math.random() * 16}px`,
                          animationDelay: `${i * 0.1}s`,
                          backgroundColor: 'var(--color-primary)'
                        }}
                      />
                    ))}
                  </div>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Listening…
                  </span>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  showAvatar={!message.isUser}
                />
              ))}
              
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div 
              className="border-t p-4"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-background)'
              }}
            >
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type how you feel…"
                  className="flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as React.CSSProperties}
                  disabled={isRecording}
                />
                
                <MicButton
                  isRecording={isRecording}
                  onClick={handleVoiceInput}
                />
                
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isRecording}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                >
                  <Send size={16} />
                </button>

                {/* Call Button */}
                <button
                  onClick={startCall}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: '#059669',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#047857'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }}
                >
                  <Phone size={16} />
                </button>
              </div>
            </div>
          </div>
        </AppShell>
      )}
    </>
  )
}
