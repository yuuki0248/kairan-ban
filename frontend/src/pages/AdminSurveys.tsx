import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSurveys, getSurveyResults, type Survey, type SurveyResults } from '../lib/api'
import { SurveyForm } from '../components/SurveyForm'
import { useUser } from '../hooks/useUser'

export default function AdminSurveys() {
  const { user, loading: userLoading } = useUser()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [resultsMap, setResultsMap] = useState<Record<string, SurveyResults>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [resultsLoading, setResultsLoading] = useState<string | null>(null)

  function loadSurveys() {
    setLoading(true)
    getSurveys()
      .then(setSurveys)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }

  useEffect(loadSurveys, [])

  async function toggleResults(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (!resultsMap[id]) {
      setResultsLoading(id)
      try {
        const data = await getSurveyResults(id)
        setResultsMap((prev) => ({ ...prev, [id]: data }))
      } finally {
        setResultsLoading(null)
      }
    }
  }

  function handleSuccess() {
    setBanner('アンケートを作成しました')
    setTimeout(() => setBanner(null), 4000)
    loadSurveys()
  }

  if (!userLoading && !user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">アクセス権限がありません</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">アンケート管理</h1>
        <Link to="/admin" className="text-sm text-blue-500">← 管理画面</Link>
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {banner}
        </div>
      )}

      <SurveyForm onSuccess={handleSuccess} />

      {loading && <p className="text-center text-gray-400 py-8 text-sm">読み込み中...</p>}
      {error && <p className="text-center text-red-500 py-8 text-sm">{error}</p>}
      {!loading && !error && surveys.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">まだアンケートがありません</p>
      )}

      <div className="space-y-3">
        {surveys.map((s) => {
          const res = resultsMap[s.id]
          const isExpanded = expandedId === s.id

          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString('ja-JP')}
                    {'　'}{s.questions.length}問
                  </p>
                </div>
                <button
                  onClick={() => toggleResults(s.id)}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 shrink-0 transition-colors"
                >
                  {isExpanded ? '閉じる' : '結果を見る'}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {resultsLoading === s.id && (
                    <p className="text-xs text-gray-400 text-center py-2">読み込み中...</p>
                  )}
                  {res && (
                    <>
                      <p className="text-xs font-semibold text-gray-500 mb-3">
                        回答数: {res.total}件
                      </p>
                      {res.survey.questions.map((q, idx) => {
                        const votes = res.tally[q.id] ?? {}
                        const total = Object.values(votes).reduce((a, b) => a + b, 0)
                        return (
                          <div key={q.id} className="mb-4 last:mb-0">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Q{idx + 1}. {q.text}
                            </p>
                            <div className="space-y-2">
                              {q.options.map((opt) => {
                                const count = votes[opt] ?? 0
                                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                                return (
                                  <div key={opt}>
                                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                                      <span>{opt}</span>
                                      <span className="font-medium">{count}票 ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-400 rounded-full transition-all duration-300"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
