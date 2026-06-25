'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Palette, Languages } from 'lucide-react'
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
  createCheckSession,
  updateSessionAnswer,
  completeCheckSession,
  Question,
  CheckResult,
} from '@/app/check/actions'

function normalizeBackendUserStatus(user: any): string | null {
  const rawStatus =
    user?.status ??
    user?.healthStatus ??
    user?.userStatus ??
    user?.pregnancyStatus ??
    null;

  if (!rawStatus) return null;

  const status = String(rawStatus).toLowerCase();

  if (status === 'pregnant') return 'pregnant';
  if (status === 'just_gave_birth') return 'just_gave_birth';
  if (status === 'postpartum') return 'postpartum';
  if (status === 'postpartum_early') return 'just_gave_birth';
  if (status === 'postpartum_late') return 'postpartum';

  return status;
}

function normalizeBackendTrimester(user: any): string | undefined {
  const rawTrimester =
    user?.trimester ??
    user?.pregnancyStage ??
    user?.stage ??
    undefined;

  if (!rawTrimester) return undefined;

  const trimester = String(rawTrimester).toLowerCase();

  const map: Record<string, string> = {
    first: '1',
    second: '2',
    third: '3',
    term: '3',
    '1st': '1',
    '2nd': '2',
    '3rd': '3',
    trimester_1: '1',
    trimester_2: '2',
    trimester_3: '3',
  };

  return map[trimester] ?? trimester;
}

async function loadQuestions(userStatus: string, trimester?: string): Promise<Question[]> {
  if (!userStatus) return [];

  const trimesterMap: Record<string, string> = {
    first: '1',
    second: '2',
    third: '3',
    term: '3',
  };

  const mappedTrimester = trimester ? trimesterMap[trimester] || trimester : undefined;

  const url = mappedTrimester
    ? `/api/check/questions/${encodeURIComponent(userStatus)}?trimester=${encodeURIComponent(mappedTrimester)}`
    : `/api/check/questions/${encodeURIComponent(userStatus)}`;

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  const questions = Array.isArray(data)
    ? data
    : Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.body)
          ? data.body
          : [];

  if (!res.ok) {
    console.error('Failed to load questions:', data);
    return [];
  }

  if (!questions.length) {
    console.error('[check] No questions found from proxy:', {
      userStatus,
      trimester,
      response: data,
    });
  }

  return questions;
}

export default function CheckPageClient() {
  const router = useRouter()
  const { toggleTheme } = useTheme()

  const [user, setUser] = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [language, setLanguage] = useState<'en' | 'sw'>('en')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [riskResult, setRiskResult] = useState<CheckResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)

        // Always fetch from backend since middleware ensures authentication via cookie
        const currentUser = await fetchCurrentUser()

        if (!currentUser?.id) {
          console.error('No user found from backend')
          router.replace('/auth')
          return
        }

        setUser(currentUser)

        const backendUserStatus = normalizeBackendUserStatus(currentUser);
        const backendTrimester = normalizeBackendTrimester(currentUser);

        console.log('[check] resolved user for questions:', {
          currentUser,
          backendUserStatus,
          backendTrimester,
        });

        if (!backendUserStatus || backendUserStatus === 'unknown') {
          console.error('[check] Cannot load questions because user status is missing/unknown:', currentUser);
          return;
        }

        const finalTrimester =
          backendUserStatus === 'pregnant'
            ? backendTrimester ?? '3'
            : backendTrimester;

        const loadedQuestions = await loadQuestions(
          backendUserStatus,
          finalTrimester,
        )

        if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
          console.error('No questions found')
          return
        }

        setQuestions(loadedQuestions)

        const session = await createCheckSession(currentUser.id)
        setSessionId((session.id || session._id) as string)
      } catch (error) {
        console.error('Home init error:', error)
        router.replace('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [router])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answer: boolean) => {
    setSelectedAnswer(answer)
  }

  const handleNext = async () => {
    if (selectedAnswer === null || !sessionId || !user) return

    try {
      await updateSessionAnswer(sessionId, currentQuestionIndex, selectedAnswer)

      const newAnswers = [...answers, selectedAnswer]
      setAnswers(newAnswers)

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
      } else {
        const result = await completeCheckSession(
          sessionId,
          user.id,
          user.status
        )
        setRiskResult(result)
        setShowResult(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load questions
      </div>
    )
  }

  return (
    <AppShell
      statusBar={{
        title: 'Symptom check',
        showBack: true,
        rightContent: showResult
          ? ''
          : `Q${currentQuestionIndex + 1} of ${questions.length}`,
        color: 'primary',
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end gap-2 px-4 py-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="p-2 rounded-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            title="Switch language"
          >
            <Languages size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
            title="Toggle theme"
          >
            <Palette size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        <QuestionProgress
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          showResult={showResult}
        />

        <div className="flex-1 px-4 py-4">
          {!showResult ? (
            <div className="space-y-4">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                language={language}
              />

              <AnswerButtons
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                language={language}
              />

              <VoiceInput
                isRecording={isRecording}
                transcript={transcript}
                onVoiceInput={() => {}}
                language={language}
              />

              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                fullWidth
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'Next question →'
                  : 'See my result →'}
              </Button>
            </div>
          ) : (
            <ResultScreen
              riskResult={riskResult}
              user={user}
              onBackToHome={() => router.replace('/home')}
              onCallCHW={() => {}}
              onCallEmergency={() => {
                window.location.href = 'tel:999'
              }}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}