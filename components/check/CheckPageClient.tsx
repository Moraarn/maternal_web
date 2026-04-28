'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import AppShell from '@/components/ui/AppShell'
import QuestionProgress from './QuestionProgress'
import QuestionScreen from './QuestionScreen'
import ResultScreen from './ResultScreen'
import { 
  getQuestions, 
  createCheckSession, 
  updateSessionAnswer, 
  completeCheckSession,
  Question,
  CheckResult
} from '@/app/check/actions'

export default function CheckPageClient() {
  const router = useRouter()
  const { user, setLastCheckup, addToHistory } = useStore()
  
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

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    // Load questions and create session when user is available
    const initializeCheck = async () => {
      try {
        setIsLoading(true)
        console.log('User data:', { status: user.status, trimester: user.trimester, id: user.id })
        const userQuestions = await getQuestions(user.status, user.trimester)
        console.log('Questions loaded:', userQuestions.length, 'questions')
        setQuestions(userQuestions)
        
        const session = await createCheckSession(user.id)
        setSessionId(session.id)
      } catch (error) {
        console.error('Error initializing check:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeCheck()
  }, [user, router])

  const currentQuestion = questions[currentQuestionIndex]

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
    if (selectedAnswer === null || !sessionId) return

    try {
      setIsLoading(true)
      
      // Update session with current answer
      await updateSessionAnswer(sessionId, currentQuestionIndex, selectedAnswer)
      
      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers)

      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setTranscript('')
      } else {
        // Complete session and get results
        const result = await completeCheckSession(sessionId, user!.id, user!.status)
        setRiskResult(result)
        setShowResult(true)
        
        // Save to store (convert backend format to frontend format)
        const now = new Date().toISOString()
        setLastCheckup({
          riskLevel: result.riskLevel as 'low' | 'medium' | 'high',
          conditionChecked: 'Maternal health symptoms',
          symptomsDetected: result.riskFactors,
          date: now
        })
        addToHistory({
          riskLevel: result.riskLevel as 'low' | 'medium' | 'high',
          date: now
        })
      }
    } catch (error) {
      console.error('Error in handleNext:', error)
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

  if (!user || questions.length === 0) {
    return null
  }

  return (
    <AppShell
      statusBar={{
        title: 'Symptom check',
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
            <QuestionScreen
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              isRecording={isRecording}
              transcript={transcript}
              isLoading={isLoading}
              onAnswerSelect={handleAnswerSelect}
              onVoiceInput={handleVoiceInput}
              onNext={handleNext}
            />
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
