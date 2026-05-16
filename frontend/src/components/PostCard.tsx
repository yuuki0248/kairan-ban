import { Link } from 'react-router-dom'
import type { Post } from '../lib/api'

const categoryStyle: Record<string, string> = {
  重要: 'bg-red-100 text-red-700',
  お知らせ: 'bg-blue-100 text-blue-700',
  イベント: 'bg-green-100 text-green-700',
}

type Props = { post: Post }

export function PostCard({ post }: Props) {
  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div
        className={`rounded-xl border p-4 mb-3 bg-white shadow-sm transition-opacity ${
          post.is_read ? 'opacity-60' : 'border-blue-300'
        }`}
      >
        <div className="flex items-start gap-2">
          {!post.is_read && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            <h2 className="font-semibold text-gray-800 truncate">{post.title}</h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.body}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{post.author?.display_name ?? '—'}</span>
          <div className="flex items-center gap-3">
            <span>既読 {post.read_count ?? 0}人</span>
            <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
