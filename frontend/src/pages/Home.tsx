import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts, type Post } from '../lib/api'
import { PostCard } from '../components/PostCard'
import { useUser } from '../hooks/useUser'

export default function Home() {
  const { user } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">回覧板</h1>
          {user && (
            <p className="text-xs text-gray-400 mt-0.5">
              {user.room_number ? `${user.room_number}号室 ` : ''}
              {user.display_name}
            </p>
          )}
        </div>
        {user?.is_admin && (
          <Link
            to="/admin"
            className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            管理画面
          </Link>
        )}
      </div>

      <nav className="flex gap-2 mb-5">
        <Link
          to="/surveys"
          className="flex-1 text-center text-sm bg-indigo-50 text-indigo-600 rounded-lg py-2.5 font-medium hover:bg-indigo-100 transition-colors"
        >
          アンケート
        </Link>
        <Link
          to="/inquiry"
          className="flex-1 text-center text-sm bg-teal-50 text-teal-600 rounded-lg py-2.5 font-medium hover:bg-teal-100 transition-colors"
        >
          お問い合わせ
        </Link>
      </nav>

      {loading && (
        <p className="text-center text-gray-400 py-16 text-sm">読み込み中...</p>
      )}
      {error && (
        <p className="text-center text-red-500 py-16 text-sm">{error}</p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="text-center text-gray-400 py-16 text-sm">お知らせはまだありません</p>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
