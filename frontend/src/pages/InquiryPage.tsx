import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InquiryForm } from '../components/InquiryForm'

export default function InquiryPage() {
  const [success, setSuccess] = useState(false)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">お問い合わせ</h1>
        <Link to="/" className="text-sm text-blue-500">← ホーム</Link>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-semibold mb-2">送信しました</p>
          <p className="text-sm text-green-600 mb-4">
            管理組合が確認次第、対応いたします。
          </p>
          <Link to="/" className="text-sm text-blue-500 hover:underline">
            ホームに戻る
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-4">
            転居連絡・駐車場申請・設備修理など、管理組合へのお問い合わせはこちらからどうぞ。
          </p>
          <InquiryForm onSuccess={() => setSuccess(true)} />
        </div>
      )}
    </div>
  )
}
