import { useState } from 'react'
import { answerSurvey, type Question } from '../lib/api'

type Props = {
  surveyId: string
  questions: Question[]
  onSuccess: () => void
}

export function SurveyAnswerForm({ surveyId, questions, onSuccess }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (questions.some((q) => !answers[q.id])) {
      setError('すべての設問に回答してください')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await answerSurvey(surveyId, answers)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {questions.map((q, idx) => (
        <div key={q.id}>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Q{idx + 1}. {q.text}
          </p>
          <div className="space-y-2 pl-2">
            {q.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? '送信中...' : '回答する'}
      </button>
    </form>
  )
}
