import { useEffect, useState } from 'react'
import { getReads, type ReadsResponse } from '../lib/api'

type Props = { postId: string }

export function ReadDashboard({ postId }: Props) {
  const [data, setData] = useState<ReadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getReads(postId)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : '取得失敗'))
      .finally(() => setLoading(false))
  }, [postId])

  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">読み込み中...</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (!data) return null

  const total = data.read.length + data.unread.length

  return (
    <div>
      <h3 className="text-base font-bold text-gray-700 mb-1">既読状況</h3>
      <p className="text-xs text-gray-400 mb-4">
        既読 {data.read.length}人 / 全 {total}人
        {total > 0 && (
          <span className="ml-2 text-blue-500 font-medium">
            ({Math.round((data.read.length / total) * 100)}%)
          </span>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-green-600 mb-2">✓ 既読</p>
          {data.read.length === 0 ? (
            <p className="text-xs text-gray-400">まだ誰も読んでいません</p>
          ) : (
            <ul className="space-y-1">
              {data.read.map((r) => (
                <li key={r.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span className="text-gray-700">
                    {r.user.room_number && (
                      <span className="text-gray-400 text-xs mr-1">{r.user.room_number}</span>
                    )}
                    {r.user.display_name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(r.read_at).toLocaleDateString('ja-JP')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">○ 未読</p>
          {data.unread.length === 0 ? (
            <p className="text-xs text-green-600">全員既読です</p>
          ) : (
            <ul className="space-y-1">
              {data.unread.map((u) => (
                <li key={u.id} className="text-sm py-1 border-b last:border-0 text-gray-500">
                  {u.room_number && (
                    <span className="text-gray-400 text-xs mr-1">{u.room_number}</span>
                  )}
                  {u.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
