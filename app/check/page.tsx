'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import AppShell from '@/components/ui/AppShell'
import QuestionCard from '@/components/check/QuestionCard'
import RiskResultComponent from '@/components/check/RiskResult'
import HospitalList from '@/components/check/HospitalList'
import Button from '@/components/ui/Button'
import { getQuestions } from '@/lib/questions'
import { calculateRisk, RiskResult } from '@/lib/riskEngine'
import { Mic } from 'lucide-react'

export default function CheckPage() {
  const router = useRouter()
  const { user, setLastCheckup, addToHistory } = useStore()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const questions = user ? getQuestions(user.status, user.trimester) : []

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
  }, [user, router])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

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

  const handleNext = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setTranscript('')
    } else {
      // Show results
      const result = calculateRisk(newAnswers, user!.status)
      setRiskResult(result)
      setShowResult(true)
      
      // Save to store
      const now = new Date().toISOString()
      setLastCheckup({
        ...result,
        date: now
      })
      addToHistory({
        riskLevel: result.riskLevel,
        date: now
      })
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
        {!showResult && (
          <div 
            className="h-1"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div 
              className="h-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
        )}

        <div className="flex-1 px-4 py-4">
          {!showResult ? (
            /* Question State */
            <div className="space-y-4">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />

              {/* Answer Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAnswerSelect(true)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedAnswer === true
                      ? 'border-danger'
                      : 'border-border hover:border-opacity-70'
                  }`}
                  style={{
                    backgroundColor: selectedAnswer === true 
                      ? 'var(--color-red-light)' 
                      : 'var(--color-background)'
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === true ? 'border-danger' : ''
                    }`}
                    style={{
                      borderColor: selectedAnswer === true 
                        ? 'var(--color-danger)' 
                        : 'var(--color-border)',
                      backgroundColor: selectedAnswer === true 
                        ? 'var(--color-danger)' 
                        : 'transparent'
                    }}
                  >
                    {selectedAnswer === true && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span 
                    className="font-medium"
                    style={{
                      color: selectedAnswer === true 
                        ? 'var(--color-red-dark)' 
                        : 'var(--color-text-primary)'
                    }}
                  >
                    Yes
                  </span>
                </button>

                <button
                  onClick={() => handleAnswerSelect(false)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selectedAnswer === false
                      ? 'border-primary'
                      : 'border-border hover:border-opacity-70'
                  }`}
                  style={{
                    backgroundColor: selectedAnswer === false 
                      ? 'var(--color-green-light)' 
                      : 'var(--color-background)'
                  }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === false ? 'border-primary' : ''
                    }`}
                    style={{
                      borderColor: selectedAnswer === false 
                        ? 'var(--color-primary)' 
                        : 'var(--color-border)',
                      backgroundColor: selectedAnswer === false 
                        ? 'var(--color-primary)' 
                        : 'transparent'
                    }}
                  >
                    {selectedAnswer === false && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span 
                    className="font-medium"
                    style={{
                      color: selectedAnswer === false 
                        ? 'var(--color-green-dark)' 
                        : 'var(--color-text-primary)'
                    }}
                  >
                    No
                  </span>
                </button>
              </div>

              {/* Voice Input */}
              <button
                onClick={handleVoiceInput}
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

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                fullWidth
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next question →' : 'See my result →'}
              </Button>
            </div>
          ) : (
            /* Result State */
            <div className="space-y-6">
              {riskResult && (
                <>
                  <RiskResultComponent result={riskResult} />

                  {/* High Risk: Hospital List */}
                  {riskResult.riskLevel === 'high' && (
                    <>
                      <HospitalList />
                      
                      <div>
                        <h3 className="text-xs uppercase text-text-secondary font-medium mb-3">
                          Call your care team
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={handleCallCHW}
                            className="flex items-center justify-center gap-2"
                          >
                            <Mic size={16} />
                            Call CHW
                          </Button>
                          <Button
                            onClick={handleCallEmergency}
                            variant="outline"
                            className="flex items-center justify-center gap-2"
                            style={{
                              color: 'var(--color-danger)',
                              borderColor: 'var(--color-danger)'
                            }}
                          >
                            <Mic size={16} />
                            Emergency: 999
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Back to Home Button */}
              <Button
                onClick={handleBackToHome}
                variant="outline"
                fullWidth
              >
                Back to home
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
