import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useLiff } from './hooks/useLiff'
import Home from './pages/Home'
import Detail from './pages/Detail'
import Admin from './pages/Admin'
import SurveyList from './pages/SurveyList'
import SurveyDetail from './pages/SurveyDetail'
import InquiryPage from './pages/InquiryPage'
import AdminSurveys from './pages/AdminSurveys'
import AdminInquiries from './pages/AdminInquiries'

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
        <Route path="/surveys" element={<SurveyList />} />
        <Route path="/surveys/:id" element={<SurveyDetail />} />
        <Route path="/inquiry" element={<InquiryPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/surveys" element={<AdminSurveys />} />
        <Route path="/admin/surveys/:id/results" element={<AdminSurveys />} />
        <Route path="/admin/inquiries" element={<AdminInquiries />} />
      </Routes>
    </BrowserRouter>
  )
}
