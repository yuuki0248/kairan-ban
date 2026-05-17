import { useState } from 'react'
import { createSurvey, type Question } from '../lib/api'

type Props = { onSuccess: () => void }

export function SurveyForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', options: ['', ''] },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addQuestion() {
    const id = `q${Date.now()}`
    setQuestions((prev) => [...prev, { id, text: '', options: ['', ''] }])
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateQuestionText(idx: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, text } : q)))
  }

  function addOption(qIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q))
    )
  }

  function removeOption(qIdx: number, optIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== optIdx) } : q
      )
    )
  }

  function updateOption(qIdx: number, optIdx: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((opt, j) => (j === optIdx ? value : opt)) }
          : q
      )
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) { setError('タイトルを入力してください'); return }
    if (questions.some((q) => !q.text.trim())) { setError('設問文を入力してください'); return }
    if (questions.some((q) => q.options.filter((o) => o.trim()).length < 2)) {
      setError('各設問に2つ以上の選択肢を入力してください')
      return
    }

    setSubmitting(true)
    try {
      const cleaned = questions.map((q) => ({
        ...q,
        options: q.options.filter((o) => o.trim()),
      }))
      await createSurvey({ title: title.trim(), questions: cleaned })
      setTitle('')
      setQuestions([{ id: 'q1', text: '', options: ['', ''] }])
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <h2 className="text-base font-bold text-gray-800 mb-4">アンケート作成</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 block mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          placeholder="例：夏祭りの開催について"
        />
      </div>

      <div className="space-y-4 mb-3">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 shrink-0">Q{qIdx + 1}</span>
              <input
                value={q.text}
                onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                placeholder="設問文を入力"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  className="text-gray-400 hover:text-red-400 text-xl leading-none shrink-0"
                >
                  ×
                </button>
              )}
            </div>
            <div className="space-y-1.5 pl-6">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">○</span>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                    placeholder={`選択肢 ${optIdx + 1}`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIdx, optIdx)}
                      className="text-gray-400 hover:text-red-400 text-sm shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qIdx)}
                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
              >
                ＋ 選択肢を追加
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="text-sm text-blue-500 hover:text-blue-700 mb-4 block"
      >
        ＋ 設問を追加
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? '作成中...' : 'アンケートを作成'}
      </button>
    </form>
  )
}
