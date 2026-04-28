import QuestionCard from './QuestionCard'
import AnswerButtons from './AnswerButtons'
import VoiceInput from './VoiceInput'
import Button from '@/components/ui/Button'
import { Question } from '@/app/check/actions'

interface QuestionScreenProps {
  currentQuestion: Question
  currentQuestionIndex: number
  totalQuestions: number
  selectedAnswer: boolean | null
  isRecording: boolean
  transcript: string
  isLoading: boolean
  onAnswerSelect: (answer: boolean) => void
  onVoiceInput: () => void
  onNext: () => void
}

export default function QuestionScreen({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  isRecording,
  transcript,
  isLoading,
  onAnswerSelect,
  onVoiceInput,
  onNext
}: QuestionScreenProps) {
  return (
    <div className="space-y-4">
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
      />

      {/* Answer Buttons */}
      <AnswerButtons
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
      />

      {/* Voice Input */}
      <VoiceInput
        isRecording={isRecording}
        transcript={transcript}
        onVoiceInput={onVoiceInput}
      />

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={selectedAnswer === null || isLoading}
        fullWidth
      >
        {currentQuestionIndex < totalQuestions - 1 ? 'Next question →' : 'See my result →'}
      </Button>
    </div>
  )
}
