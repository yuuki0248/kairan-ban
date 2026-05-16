import { Hono } from 'hono'
import { authMiddleware, adminMiddleware, type UserVar } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

export const readsRouter = new Hono<UserVar>()

// POST /reads — 既読登録（重複はUNIQUE制約で無視）
readsRouter.post('/', authMiddleware, async (c) => {
  const user = c.get('user')
  const { post_id } = await c.req.json<{ post_id: string }>()
  if (!post_id) return c.json({ error: 'post_id is required' }, 400)

  const { error } = await supabase
    .from('reads')
    .upsert({ post_id, user_id: user.id }, { onConflict: 'post_id,user_id', ignoreDuplicates: true })

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// GET /reads/:postId — 既読/未読一覧（管理者のみ）
readsRouter.get('/:postId', authMiddleware, adminMiddleware, async (c) => {
  const postId = c.req.param('postId')

  const [readsResult, allUsersResult] = await Promise.all([
    supabase
      .from('reads')
      .select('id, user_id, read_at, user:users(display_name, room_number)')
      .eq('post_id', postId)
      .order('read_at', { ascending: false }),
    supabase
      .from('users')
      .select('id, display_name, room_number')
      .order('room_number', { ascending: true, nullsFirst: false }),
  ])

  if (readsResult.error) return c.json({ error: readsResult.error.message }, 500)

  const readUserIdSet = new Set(readsResult.data?.map((r) => r.user_id) ?? [])

  return c.json({
    read: readsResult.data ?? [],
    unread: (allUsersResult.data ?? []).filter((u) => !readUserIdSet.has(u.id)),
  })
})
