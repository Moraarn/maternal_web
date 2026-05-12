'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import AppShell from '@/components/ui/AppShell'
import QuestionProgress from './QuestionProgress'
import QuestionCard from './QuestionCard'
import AnswerButtons from './AnswerButtons'
import VoiceInput from './VoiceInput'
import ResultScreen from './ResultScreen'
import Button from '@/components/ui/Button'
import { fetchCurrentUser } from '@/lib/auth'
import type { User } from '@/store/useStore'
import {
  getQuestions,
  createCheckSession,
  updateSessionAnswer,
  completeCheckSession,
  Question,
  CheckResult
} from '@/app/check/actions'

const translations = {
  en: {
    title: 'Symptom check',
    next: 'Next question →',
    result: 'See my result →',
    floatingLabel: 'Tell me how you feel',
    switchTo: 'KI',
    switchLabel: 'Kiswahili',
    currentLabel: 'English',
    currentCode: 'EN',
  },
  sw: {
    title: 'Uchunguzi wa dalili',
    next: 'Swali lijalo →',
    result: 'Ona matokeo yangu →',
    floatingLabel: 'Niambie unavyohisi',
    switchTo: 'EN',
    switchLabel: 'English',
    currentLabel: 'Kiswahili',
    currentCode: 'KI',
  },
}

export default function CheckPageClient() {
  const router = useRouter()
  const { toggleTheme } = useTheme()

  const [user, setUser] = useState<User | null>(null)
  const [language, setLanguage] = useState<'en' | 'sw'>('en')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [riskResult, setRiskResult] = useState<CheckResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const t = translations[language]

  useEffect(() => {
    const initializeCheck = async () => {
      try {
        setIsLoading(true)
        // Fetch user from backend
        const currentUser = await fetchCurrentUser()

        if (!currentUser || !currentUser.id || !currentUser.status) {
          console.error('❌ [Check Page Client] No valid user found, redirecting to auth', { currentUser })
          router.push('/auth')
          return
        }

        setUser(currentUser)
        console.log('✅ [Check Page Client] User fetched:', { 
          id: currentUser.id,
          status: currentUser.status, 
          trimester: currentUser.trimester 
        })

        console.log('📋 [Check Page Client] Fetching questions for:', { 
          status: currentUser.status,
          trimester: currentUser.trimester 
        })
        
        const userQuestions = await getQuestions(currentUser.status, currentUser.trimester)
        console.log('📋 [Check Page Client] Questions response received:', {
          responseType: typeof userQuestions,
          isArray: Array.isArray(userQuestions),
          count: Array.isArray(userQuestions) ? userQuestions.length : 'N/A',
          value: userQuestions,
          userStatus: currentUser.status,
          trimester: currentUser.trimester
        })

        // Ensure we have an array
        if (!Array.isArray(userQuestions)) {
          console.error('❌ [Check Page Client] Expected array but got:', typeof userQuestions, userQuestions)
          setQuestions([])
          return
        }

        if (userQuestions.length === 0) {
          console.warn('⚠️ [Check Page Client] No questions found for user status:', currentUser.status)
        }

        console.log('✅ [Check Page Client] Questions loaded:', {
          count: userQuestions.length,
          userStatus: currentUser.status,
          trimester: currentUser.trimester,
          questions: userQuestions.map(q => ({
            id: q.id,
            text: q.text,
            tag: q.tag,
            userStatus: q.userStatus,
            trimester: q.trimester
          }))
        })
        setQuestions(userQuestions)

        console.log('📝 [Check Page Client] Creating session for user:', currentUser.id)
        const session = await createCheckSession(currentUser.id)
        const sessionId = (session.id || session._id) as string // Handle both id and _id from backend
        console.log('✅ [Check Page Client] Session created:', { sessionId, userId: currentUser.id })
        setSessionId(sessionId)
      } catch (error: any) {
        console.error('❌ [Check Page Client] Error initializing check:', {
          message: error?.message,
          error: error
        })
        // If unauthorized, redirect to auth
        if (error.message === 'Unauthorized' || error.message?.includes('401')) {
          console.log('🔄 [Check Page Client] Unauthorized, redirecting to auth')
          router.push('/auth')
        } else {
          throw error
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeCheck()
  }, [router])

  const currentQuestion = questions[currentQuestionIndex]
  
  // Debug current question
  console.log('🎯 [Check Page Client] Current question:', {
    currentQuestionIndex,
    totalQuestions: questions.length,
    currentQuestion: currentQuestion ? {
      id: currentQuestion.id,
      text: currentQuestion.text,
      tag: currentQuestion.tag
    } : null,
    questionsAvailable: questions.length > 0
  })

  const getStatusBarColor = () => {
    if (!riskResult) return 'primary'
    switch (riskResult.riskLevel) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      default: return 'primary'
    }
  }

  const handleAnswerSelect = (answer: boolean) => {
    setSelectedAnswer(answer)
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording and process transcript
      setIsRecording(false)
      processVoiceAnswer(transcript)
    } else {
      // Start recording
      setIsRecording(true)
      setTranscript('')
      // TODO: Implement Web Speech API
      // For now, simulate voice input
      setTimeout(() => {
        const simulatedTranscript = Math.random() > 0.5 ? "yes" : "no"
        setTranscript(simulatedTranscript)
        setIsRecording(false)
        processVoiceAnswer(simulatedTranscript)
      }, 2000)
    }
  }

  const processVoiceAnswer = (voiceTranscript: string) => {
    const lowerTranscript = voiceTranscript.toLowerCase()
    const yesWords = ['yes', 'ndiyo', 'naam', 'oui', 'sawa', 'ndio']
    const noWords = ['no', 'hapana', 'la', 'non', 'hapana']
    
    if (yesWords.some(word => lowerTranscript.includes(word))) {
      setSelectedAnswer(true)
    } else if (noWords.some(word => lowerTranscript.includes(word))) {
      setSelectedAnswer(false)
    }
  }

  const handleNext = async () => {
    console.log('🎯 [Check Page Client] handleNext called:', {
      selectedAnswer,
      sessionId,
      currentQuestionIndex,
      questionsLength: questions.length,
      shouldMoveToNext: currentQuestionIndex < questions.length - 1,
      shouldComplete: currentQuestionIndex >= questions.length - 1
    })

    if (selectedAnswer === null || !sessionId) {
      console.log('❌ [Check Page Client] Cannot proceed - missing answer or session')
      return
    }

    try {
      setIsLoading(true)
      
      console.log('💾 [Check Page Client] Updating session with answer...')
      // Update session with current answer
      await updateSessionAnswer(sessionId, currentQuestionIndex, selectedAnswer)
      
      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers)
      console.log('✅ [Check Page Client] Answer saved to session:', { 
        answerIndex: currentQuestionIndex, 
        answer: selectedAnswer,
        totalAnswers: newAnswers.length 
      })

      if (questions.length === 0) {
        console.error('❌ [Check Page Client] No questions available - cannot proceed')
        return
      }

      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        console.log('➡️ [Check Page Client] Moving to next question:', {
          from: currentQuestionIndex,
          to: currentQuestionIndex + 1,
          totalQuestions: questions.length
        })
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setTranscript('')
      } else {
        console.log('🏁 [Check Page Client] Completing session...')
        // Complete session and get results
        const result = await completeCheckSession(sessionId, user!.id, user!.status)
        setRiskResult(result)
        setShowResult(true)
      }
    } catch (error) {
      console.error('❌ [Check Page Client] Error in handleNext:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/home')
  }

  const handleCallCHW = () => {
    if (user?.chwPhone) {
      window.location.href = `tel:${user.chwPhone}`
    } else {
      alert('No CHW registered. Add one in your profile.')
    }
  }

  const handleCallEmergency = () => {
    window.location.href = 'tel:999'
  }

  const handleTalkClick = () => router.push('/talk')
  const toggleLanguage = () => setLanguage(language === 'en' ? 'sw' : 'en')

  if (!user || questions.length === 0) {
    return null
  }

  return (
    <AppShell
      statusBar={{
        title: t.title,
        showBack: true,
        rightContent: showResult ? '' : `Q${currentQuestionIndex + 1} of ${questions.length}`,
        color: getStatusBarColor()
      }}
    >
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <QuestionProgress
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          showResult={showResult}
        />

        <div className="flex-1 px-4 py-4">
          {!showResult ? (
            <div className="space-y-4">
              {/* Language and Theme Switchers */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={toggleLanguage}
                  aria-label={`Switch to ${t.switchLabel}`}
                  className="group relative flex items-center gap-0 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    border: '1.5px solid var(--color-primary)',
                    height: '36px',
                  }}
                >
                  {/* Active segment */}
                  <span
                    className="flex items-center gap-1.5 px-3 h-full text-sm font-semibold tracking-wide"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      minWidth: '56px',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      className="text-xs leading-none"
                      style={{ opacity: 0.75 }}
                    >
                      {language === 'en' ? '🇬🇧' : '🇰🇪'}
                    </span>
                    {t.currentCode}
                  </span>

                  {/* Divider */}
                  <span
                    className="w-px h-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />

                  {/* Inactive / switch-to segment */}
                  <span
                    className="flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors duration-200"
                    style={{
                      color: 'var(--color-primary)',
                      minWidth: '56px',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      className="text-xs leading-none"
                      style={{ opacity: 0.6 }}
                    >
                      {language === 'en' ? '🇰🇪' : '🇬🇧'}
                    </span>
                    {t.switchTo}
                  </span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center rounded-full transition-all duration-200 hover:opacity-80 active:scale-95"
                  style={{
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    width: '36px',
                    height: '36px',
                  }}
                  aria-label="Toggle theme"
                >
                  <Palette className="w-5 h-5" strokeWidth={1.75} style={{ color: 'var(--color-text-secondary)' }} />
                </button>
              </div>

              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                language={language}
              />

              {/* Answer Buttons */}
              <AnswerButtons
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                language={language}
              />

              {/* Voice Input */}
              <VoiceInput
                isRecording={isRecording}
                transcript={transcript}
                onVoiceInput={handleVoiceInput}
                language={language}
              />

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null || isLoading}
                fullWidth
              >
                {currentQuestionIndex < questions.length - 1 ? t.next : t.result}
              </Button>

              {/* Talk Button — inline, full width pill */}
              <button
                onClick={handleTalkClick}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-full transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{
                  border: '1.5px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  backgroundColor: 'transparent',
                }}
                aria-label={t.floatingLabel}
              >
                <MessageCircle className="w-5 h-5" strokeWidth={1.75} />
                <span className="text-sm font-medium">{t.floatingLabel}</span>
              </button>
            </div>
          ) : (
            <ResultScreen
              riskResult={riskResult}
              user={user}
              onBackToHome={handleBackToHome}
              onCallCHW={handleCallCHW}
              onCallEmergency={handleCallEmergency}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}
