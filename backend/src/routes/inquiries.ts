import { Hono } from 'hono'
import { authMiddleware, adminMiddleware, type UserVar } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

const VALID_STATUSES = ['pending', 'in_progress', 'done'] as const
type Status = typeof VALID_STATUSES[number]

export const inquiriesRouter = new Hono<UserVar>()

// GET /inquiries — 一覧（管理者のみ）
inquiriesRouter.get('/', authMiddleware, adminMiddleware, async (c) => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, user:users(display_name, room_number)')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// POST /inquiries — 問い合わせ送信
inquiriesRouter.post('/', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{ category: string; body: string }>()

  if (!body.category || !body.body) {
    return c.json({ error: 'category and body are required' }, 400)
  }

  const { data, error } = await supabase
    .from('inquiries')
    .insert({ user_id: user.id, category: body.category, body: body.body })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// PATCH /inquiries/:id/status — ステータス更新（管理者のみ）
inquiriesRouter.patch('/:id/status', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ status: string }>()

  if (!VALID_STATUSES.includes(body.status as Status)) {
    return c.json({ error: 'invalid status' }, 400)
  }

  const { data, error } = await supabase
    .from('inquiries')
    .update({ status: body.status })
    .eq('id', id)
    .select('*, user:users(display_name, room_number)')
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})
