import { useState } from 'react'
import { createInquiry } from '../lib/api'

const CATEGORIES = ['転居連絡', '駐車場申請', '設備修理', '騒音・トラブル', 'その他']

type Props = { onSuccess: () => void }

export function InquiryForm({ onSuccess }: Props) {
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { setError('カテゴリを選択してください'); return }
    if (!body.trim()) { setError('お問い合わせ内容を入力してください'); return }

    setSubmitting(true)
    setError(null)
    try {
      await createInquiry({ category, body: body.trim() })
      setCategory('')
      setBody('')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="">選択してください</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">内容</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
          placeholder="お問い合わせ内容を入力してください"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? '送信中...' : '送信する'}
      </button>
    </form>
  )
}
