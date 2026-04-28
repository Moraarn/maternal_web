// app/check/actions.ts
'use server'

import { api } from '@/lib/api'
import { getQuestions as getLocalQuestions, Question as LocalQuestion } from '@/lib/questions'

export interface Question {
  id: number
  tag: string
  text: string
  hint: string
  userStatus: string
  trimester?: string
}

export interface RiskResult {
  riskLevel: 'low' | 'medium' | 'high'
  conditionChecked: string
  symptomsDetected: string[]
}

export interface CheckResult {
  id: string
  userId: string
  answers: boolean[]
  riskLevel: string
  riskFactors: string[]
  recommendations: string[]
  date: string
  questions: Question[]
  riskResults: RiskResult[]
}

export interface CheckSession {
  id: string
  userId: string
  currentQuestionIndex: number
  answers: boolean[]
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

export async function getQuestions(userStatus: string, trimester?: string): Promise<Question[]> {
  console.log('getQuestions called with:', { userStatus, trimester })
  try {
    const response = await api.get(`/check/questions/${userStatus}`, {
      params: trimester ? { trimester } : {}
    })
    console.log('Backend response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching questions:', error)
    // Fallback to local questions if backend fails
    const localQuestions = getLocalQuestions(userStatus as any, trimester as any)
    console.log('Using local questions:', localQuestions.length, 'questions')
    
    // Convert LocalQuestion to Question format (add userStatus field)
    return localQuestions.map(q => ({
      ...q,
      userStatus: userStatus === 'postpartum_early' ? 'postpartum' : userStatus,
      trimester
    }))
  }
}

export async function createCheckSession(userId: string): Promise<CheckSession> {
  try {
    const response = await api.post('/check/session', { userId })
    return response.data
  } catch (error) {
    console.error('Error creating check session:', error)
    throw error
  }
}

export async function updateSessionAnswer(
  sessionId: string, 
  answerIndex: number, 
  answer: boolean
): Promise<CheckSession> {
  try {
    const response = await api.post(`/check/session/${sessionId}/answer`, {
      answerIndex,
      answer
    })
    return response.data
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

export async function completeCheckSession(
  sessionId: string,
  userId: string,
  userStatus: string
): Promise<CheckResult> {
  try {
    const response = await api.post(`/check/session/${sessionId}/complete`, {
      userId,
      userStatus
    })
    return response.data
  } catch (error) {
    console.error('Error completing check session:', error)
    throw error
  }
}

export async function getUserCheckHistory(userId: string): Promise<CheckResult[]> {
  try {
    const response = await api.get(`/check/history/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching check history:', error)
    return []
  }
}

export async function getLastCheckResult(userId: string): Promise<CheckResult | null> {
  try {
    const response = await api.get(`/check/last/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching last check result:', error)
    return null
  }
}