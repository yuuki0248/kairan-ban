const BASE = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api'

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-line-user-id': sessionStorage.getItem('line_user_id') ?? '',
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...init })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export async function syncUser(data: {
  line_user_id: string
  display_name: string
  room_number?: string
}) {
  const res = await fetch(`${BASE}/users/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? res.statusText)
  }
  return res.json()
}

export type Post = {
  id: string
  title: string
  body: string
  category: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  author_id: string
  author: { display_name: string; room_number: string | null } | null
  is_read: boolean
  read_count?: number
}

export type Me = {
  id: string
  line_user_id: string
  display_name: string
  is_admin: boolean
  room_number: string | null
}

export const getMe = () => req<Me>('/users/me')

export const getPosts = () => req<Post[]>('/posts')
export const getPost = (id: string) => req<Post>(`/posts/${id}`)

export function createPost(data: {
  title: string
  body: string
  category?: string
  image_url?: string
}) {
  return req<Post>('/posts', { method: 'POST', body: JSON.stringify(data) })
}

export const markAsRead = (post_id: string) =>
  req<{ ok: boolean }>('/reads', { method: 'POST', body: JSON.stringify({ post_id }) })

export type ReadsResponse = {
  read: {
    id: string
    user_id: string
    read_at: string
    user: { display_name: string; room_number: string | null }
  }[]
  unread: { id: string; display_name: string; room_number: string | null }[]
}

export const getReads = (postId: string) => req<ReadsResponse>(`/reads/${postId}`)

// ---- Surveys ----

export type Question = { id: string; text: string; options: string[] }

export type Survey = {
  id: string
  title: string
  questions: Question[]
  author_id: string | null
  author: { display_name: string } | null
  created_at: string
  is_answered: boolean
}

export type SurveyDetail = {
  id: string
  title: string
  questions: Question[]
  author_id: string | null
  author: { display_name: string } | null
  created_at: string
  my_answer: Record<string, string> | null
}

export type SurveyResults = {
  survey: { id: string; title: string; questions: Question[]; created_at: string }
  tally: Record<string, Record<string, number>>
  total: number
}

export const getSurveys = () => req<Survey[]>('/surveys')
export const getSurvey = (id: string) => req<SurveyDetail>(`/surveys/${id}`)
export const createSurvey = (data: { title: string; questions: Question[] }) =>
  req<Survey>('/surveys', { method: 'POST', body: JSON.stringify(data) })
export const answerSurvey = (id: string, answers: Record<string, string>) =>
  req<{ ok: boolean }>(`/surveys/${id}/answers`, { method: 'POST', body: JSON.stringify({ answers }) })
export const getSurveyResults = (id: string) => req<SurveyResults>(`/surveys/${id}/results`)

// ---- Inquiries ----

export type Inquiry = {
  id: string
  user_id: string
  category: string
  body: string
  status: 'pending' | 'in_progress' | 'done'
  created_at: string
  user: { display_name: string; room_number: string | null } | null
}

export const getInquiries = () => req<Inquiry[]>('/inquiries')
export const createInquiry = (data: { category: string; body: string }) =>
  req<Inquiry>('/inquiries', { method: 'POST', body: JSON.stringify(data) })
export const updateInquiryStatus = (id: string, status: Inquiry['status']) =>
  req<Inquiry>(`/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
