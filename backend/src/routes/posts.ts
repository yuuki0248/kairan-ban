import { Hono } from 'hono'
import { authMiddleware, adminMiddleware, type UserVar } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'
import { sendPushNotification } from '../lib/line.js'

export const postsRouter = new Hono<UserVar>()

// GET /posts — お知らせ一覧（自分の既読状態・既読人数を付加）
postsRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user')

  const [postsResult, myReadsResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:users(display_name, room_number), reads(id)')
      .order('created_at', { ascending: false }),
    supabase
      .from('reads')
      .select('post_id')
      .eq('user_id', user.id),
  ])

  if (postsResult.error) return c.json({ error: postsResult.error.message }, 500)

  const readPostIds = new Set(myReadsResult.data?.map((r) => r.post_id) ?? [])

  const posts = postsResult.data.map(({ reads, ...post }) => ({
    ...post,
    read_count: (reads as { id: string }[]).length,
    is_read: readPostIds.has(post.id),
  }))

  return c.json(posts)
})

// GET /posts/:id — お知らせ詳細（自分の既読状態を付加）
postsRouter.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const postId = c.req.param('id')

  const [postResult, readResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:users(display_name, room_number)')
      .eq('id', postId)
      .single(),
    supabase
      .from('reads')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (postResult.error || !postResult.data) return c.json({ error: 'Post not found' }, 404)

  return c.json({ ...postResult.data, is_read: !!readResult.data })
})

// POST /posts — お知らせ新規投稿（管理者のみ）。投稿後に全住民へLINEプッシュ通知
postsRouter.post('/', authMiddleware, adminMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{
    title: string
    body: string
    category?: string
    image_url?: string
  }>()

  const { title, body: postBody, category, image_url } = body
  if (!title || !postBody) return c.json({ error: 'title and body are required' }, 400)

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ title, body: postBody, category, image_url, author_id: user.id })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)

  // 投稿者以外の全住民へ非同期でLINEプッシュ通知（失敗しても投稿は成功扱い）
  supabase
    .from('users')
    .select('line_user_id')
    .neq('line_user_id', user.line_user_id)
    .then(({ data: recipients }) => {
      if (!recipients?.length) return
      const ids = recipients.map((u) => u.line_user_id)
      const message = `【新着お知らせ】\n${title}\n\nアプリから詳細をご確認ください。`
      return sendPushNotification(ids, message)
    })
    .catch(console.error)

  return c.json(post, 201)
})
