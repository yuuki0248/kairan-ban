import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInquiries, updateInquiryStatus, type Inquiry } from '../lib/api'
import { useUser } from '../hooks/useUser'

const STATUS_LABELS: Record<Inquiry['status'], string> = {
  pending: '未対応',
  in_progress: '対応中',
  done: '完了',
}

const STATUS_COLORS: Record<Inquiry['status'], string> = {
  pending: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}

const NEXT_STATUS: Record<Inquiry['status'], Inquiry['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
}

export default function AdminInquiries() {
  const { user, loading: userLoading } = useUser()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    getInquiries()
      .then(setInquiries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusUpdate(inq: Inquiry) {
    const next = NEXT_STATUS[inq.status]
    setUpdating(inq.id)
    try {
      const updated = await updateInquiryStatus(inq.id, next)
      setInquiries((prev) => prev.map((i) => (i.id === inq.id ? updated : i)))
    } finally {
      setUpdating(null)
    }
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
        <h1 className="text-xl font-bold text-gray-800">問い合わせ管理</h1>
        <Link to="/admin" className="text-sm text-blue-500">← 管理画面</Link>
      </div>

      {loading && <p className="text-center text-gray-400 py-16 text-sm">読み込み中...</p>}
      {error && <p className="text-center text-red-500 py-16 text-sm">{error}</p>}
      {!loading && !error && inquiries.length === 0 && (
        <p className="text-center text-gray-400 py-16 text-sm">問い合わせはまだありません</p>
      )}

      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-semibold text-gray-700">{inq.category}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {inq.user?.room_number ? `${inq.user.room_number}号室 ` : ''}
                  {inq.user?.display_name}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[inq.status]}`}>
                {STATUS_LABELS[inq.status]}
              </span>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{inq.body}</p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {new Date(inq.created_at).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {inq.status !== 'done' && (
                <button
                  onClick={() => handleStatusUpdate(inq)}
                  disabled={updating === inq.id}
                  className="text-xs text-blue-500 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                >
                  {updating === inq.id
                    ? '更新中...'
                    : `→ ${STATUS_LABELS[NEXT_STATUS[inq.status]]}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
