// app/check/actions.ts
'use server'

import { api } from '@/server/api'

export interface Question {
  id: number
  tag: string
  text: string
  hint: string
  text_sw: string
  hint_sw: string
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
  smsAlertStatus?: {
    chwSent: boolean
    emergencySent: boolean
  }
}

export interface CheckSession {
  id?: string
  _id?: string
  userId: string
  currentQuestionIndex: number
  answers: boolean[]
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

export async function getQuestions(userStatus: string, trimester?: string): Promise<Question[]> {
  console.log(' [Check Actions] getQuestions called with:', { userStatus, trimester })
  try {
    console.log(' [Check Actions] Calling backend API...')
    
    // Map trimester from words to numbers for backend compatibility
    const trimesterMap: Record<string, string> = {
      'first': '1',
      'second': '2',
      'third': '3',
      'term': '3' // Map term to 3rd trimester
    }
    const mappedTrimester = trimester ? trimesterMap[trimester] || trimester : undefined
    
    const url = mappedTrimester ? `/check/questions/${userStatus}?trimester=${mappedTrimester}` : `/check/questions/${userStatus}`
    const response = await api.get(url)
    console.log(' [Check Actions] Backend response received:', {
      success: response.success,
      dataType: typeof response.body,
      isArray: Array.isArray(response.body),
      dataLength: Array.isArray(response.body) ? response.body.length : 'N/A',
      data: response.body
    })
    
    // Ensure we return an array
    if (!response.success || !Array.isArray(response.body)) {
      console.error(' [Check Actions] Backend returned non-array:', typeof response.body, response.body)
      throw new Error('Backend returned invalid data format')
    }
    
    return response.body
  } catch (error) {
    console.error(' [Check Actions] Error fetching questions from backend:', error)
    throw new Error('Failed to fetch questions from backend. Please ensure the backend server is running.')
  }
}

export async function createCheckSession(userId: string): Promise<CheckSession> {
  console.log(' [Check Actions] Creating session for user:', userId)
  try {
    const response = await api.post('/check/session', { userId })
    console.log(' [Check Actions] Session creation response:', {
      success: response.success,
      hasBody: !!response.body,
      body: response.body,
      message: response.message
    })
    if (response.success && response.body) {
      console.log(' [Check Actions] Session created successfully:', response.body)
      return response.body as CheckSession
    }
    throw new Error(response.message || 'Failed to create check session')
  } catch (error) {
    console.error(' [Check Actions] Error creating check session:', error)
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
    if (response.success && response.body) {
      return response.body as CheckSession
    }
    throw new Error(response.message || 'Failed to update session answer')
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
  console.log(' [Check Actions] Completing session:', { sessionId, userId, userStatus })
  try {
    const response = await api.post(`/check/session/${sessionId}/complete`, {
      userId,
      userStatus
    })
    console.log(' [Check Actions] Session completion response:', {
      success: response.success,
      hasBody: !!response.body,
      body: response.body,
      message: response.message
    })
    if (response.success && response.body) {
      console.log(' [Check Actions] Session completed successfully:', response.body)
      return (response.body as any).data as CheckResult
    }
    throw new Error(response.message || 'Failed to complete check session')
  } catch (error) {
    console.error(' [Check Actions] Error completing check session:', error)
    throw error
  }
}

export async function getUserCheckHistory(userId: string): Promise<CheckResult[]> {
  try {
    const response = await api.get(`/check/history/${userId}`)
    if (response.success && response.body) {
      return response.body as CheckResult[]
    }
    console.error('Failed to fetch check history:', response.message)
    return []
  } catch (error) {
    console.error('Error fetching check history:', error)
    return []
  }
}

export async function getLastCheckResult(userId: string): Promise<CheckResult | null> {
  try {
    const response = await api.get(`/check/last/${userId}`)
    if (response.success && response.body) {
      return response.body as CheckResult | null
    }
    console.error('Failed to fetch last check result:', response.message)
    return null
  } catch (error) {
    console.error('Error fetching last check result:', error)
    return null
  }
}