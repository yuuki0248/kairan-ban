import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPost, markAsRead, type Post } from '../lib/api'
import { ReadDashboard } from '../components/ReadDashboard'
import { useUser } from '../hooks/useUser'

const categoryStyle: Record<string, string> = {
  重要: 'bg-red-100 text-red-700',
  お知らせ: 'bg-blue-100 text-blue-700',
  イベント: 'bg-green-100 text-green-700',
}

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!id) return
    getPost(id)
      .then(setPost)
      .finally(() => setLoading(false))
  }, [id])

  async function handleMarkAsRead() {
    if (!id || !post || post.is_read) return
    setMarking(true)
    try {
      await markAsRead(id)
      setPost((prev) => (prev ? { ...prev, is_read: true } : prev))
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">お知らせが見つかりません</p>
        <Link to="/" className="text-blue-500 text-sm">← 一覧に戻る</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-blue-500 mb-4 inline-block">
        ← 一覧に戻る
      </Link>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {post.category && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                categoryStyle[post.category] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {post.category}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-800">{post.title}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {post.author?.display_name ?? '—'}
          {post.author?.room_number ? ` (${post.author.room_number}号室)` : ''}
          {' ・ '}
          {new Date(post.created_at).toLocaleDateString('ja-JP')}
        </p>

        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="mt-4 rounded-lg w-full object-cover max-h-72"
          />
        )}

        <p className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
          {post.body}
        </p>

        <div className="mt-6">
          {post.is_read ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-50 text-green-600 font-medium text-sm">
              <span>✓</span>
              <span>既読済み</span>
            </div>
          ) : (
            <button
              onClick={handleMarkAsRead}
              disabled={marking}
              className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {marking ? '処理中...' : '既読にする'}
            </button>
          )}
        </div>
      </div>

      {user?.is_admin && id && (
        <div className="bg-white rounded-xl border shadow-sm p-5 mt-4">
          <ReadDashboard postId={id} />
        </div>
      )}
    </div>
  )
}
