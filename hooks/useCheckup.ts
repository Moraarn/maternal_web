import { useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { calculateRisk, RiskResult } from '@/lib/riskEngine'
import { Question } from '@/app/check/actions'

export function useCheckup(questions: Question[]) {
  const { user, setLastCheckup, addToHistory } = useStore()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState<RiskResult | null>(null)

  const resetCheckup = useCallback(() => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setIsCompleted(false)
    setResult(null)
  }, [])

  const selectAnswer = useCallback((answer: boolean) => {
    setSelectedAnswer(answer)
  }, [])

  const nextQuestion = useCallback(() => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      // Complete checkup
      if (user) {
        const riskResult = calculateRisk(newAnswers, user.status)
        setResult(riskResult)
        setIsCompleted(true)

        // Save to store
        const now = new Date().toISOString()
        setLastCheckup({
          ...riskResult,
          date: now
        })
        addToHistory({
          riskLevel: riskResult.riskLevel,
          date: now
        })
      }
    }
  }, [selectedAnswer, answers, currentQuestionIndex, questions.length, user, setLastCheckup, addToHistory])

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Remove the last answer if going back
      const newAnswers = answers.slice(0, -1)
      setAnswers(newAnswers)
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, answers])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  return {
    // State
    questions,
    currentQuestion,
    currentQuestionIndex,
    answers,
    selectedAnswer,
    isCompleted,
    result,
    progress,
    isLastQuestion,
    
    // Actions
    selectAnswer,
    nextQuestion,
    previousQuestion,
    resetCheckup,
    
    // Computed
    canProceed: selectedAnswer !== null,
    hasStarted: answers.length > 0
  }
}
