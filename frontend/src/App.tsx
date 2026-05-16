import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useLiff } from './hooks/useLiff'
import Home from './pages/Home'
import Detail from './pages/Detail'
import Admin from './pages/Admin'

export default function App() {
  const { isReady, error } = useLiff()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <p className="text-red-500 text-sm text-center">
          LIFFの初期化に失敗しました。<br />{error}
        </p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<Detail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
