import { Question } from '@/lib/questions'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
}

export default function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <div 
      className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2">
        <span 
          className="text-xs uppercase font-medium px-2 py-1 rounded"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-green-light)'
          }}
        >
          {question.tag}
        </span>
      </div>
      
      <h3 
        className="text-lg font-semibold leading-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.text}
      </h3>
      
      <p 
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {question.hint}
      </p>
    </div>
  )
}
