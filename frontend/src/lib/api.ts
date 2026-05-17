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

export function syncUser(data: {
  line_user_id: string
  display_name: string
  room_number?: string
}) {
  return fetch(`${BASE}/users/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json())
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
