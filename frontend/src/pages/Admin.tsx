import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PostForm } from '../components/PostForm'
import { useUser } from '../hooks/useUser'

export default function Admin() {
  const { user, loading } = useUser()
  const [banner, setBanner] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  if (!user?.is_admin) {
    return <Navigate to="/" replace />
  }

  function handleSuccess() {
    setBanner('投稿しました。全住民へLINE通知を送信しました。')
    setTimeout(() => setBanner(null), 5000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">管理画面</h1>
        <Link to="/" className="text-sm text-blue-500">← 一覧に戻る</Link>
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {banner}
        </div>
      )}

      <PostForm onSuccess={handleSuccess} />
    </div>
  )
}
