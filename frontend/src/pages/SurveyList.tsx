import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSurveys, type Survey } from '../lib/api'

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSurveys()
      .then(setSurveys)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">アンケート</h1>
        <Link to="/" className="text-sm text-blue-500">← ホーム</Link>
      </div>

      {loading && (
        <p className="text-center text-gray-400 py-16 text-sm">読み込み中...</p>
      )}
      {error && (
        <p className="text-center text-red-500 py-16 text-sm">{error}</p>
      )}
      {!loading && !error && surveys.length === 0 && (
        <p className="text-center text-gray-400 py-16 text-sm">アンケートはまだありません</p>
      )}

      <div className="space-y-3">
        {surveys.map((s) => (
          <Link
            key={s.id}
            to={`/surveys/${s.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">{s.title}</p>
              {s.is_answered ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0 font-medium">
                  回答済み
                </span>
              ) : (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full shrink-0 font-medium">
                  未回答
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {new Date(s.created_at).toLocaleDateString('ja-JP')}
              {'　'}
              {s.questions.length}問
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
