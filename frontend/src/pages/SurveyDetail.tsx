import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSurvey, type SurveyDetail } from '../lib/api'
import { SurveyAnswerForm } from '../components/SurveyAnswerForm'
import { useUser } from '../hooks/useUser'

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const [survey, setSurvey] = useState<SurveyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    if (!id) return
    setLoading(true)
    getSurvey(id)
      .then(setSurvey)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-red-500 text-sm">{error ?? 'アンケートが見つかりません'}</p>
        <Link to="/surveys" className="text-sm text-blue-500 mt-4 block">← 一覧に戻る</Link>
      </div>
    )
  }

  const isAnswered = survey.my_answer !== null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">{survey.title}</h1>
        <Link to="/surveys" className="text-sm text-blue-500 shrink-0">← 一覧</Link>
      </div>

      {user?.is_admin && (
        <Link
          to={`/admin/surveys/${id}/results`}
          className="block text-center text-sm text-blue-500 border border-blue-200 rounded-lg py-2 mb-5 hover:bg-blue-50 transition-colors"
        >
          集計結果を確認する →
        </Link>
      )}

      {isAnswered ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700 text-sm font-semibold mb-3">回答済みです</p>
          <div className="space-y-3">
            {survey.questions.map((q, idx) => (
              <div key={q.id}>
                <p className="text-xs text-gray-500">Q{idx + 1}. {q.text}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5 pl-2">
                  → {survey.my_answer?.[q.id]}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <SurveyAnswerForm
            surveyId={survey.id}
            questions={survey.questions}
            onSuccess={load}
          />
        </div>
      )}
    </div>
  )
}
