import { createMiddleware } from 'hono/factory'
import { supabase } from '../lib/supabase.js'

type User = {
  id: string
  line_user_id: string
  display_name: string
  is_admin: boolean
  room_number: string | null
}

export type UserVar = {
  Variables: { user: User }
}

export const authMiddleware = createMiddleware<UserVar>(async (c, next) => {
  const lineUserId = c.req.header('x-line-user-id')
  if (!lineUserId) return c.json({ error: 'Unauthorized' }, 401)

  const { data: user, error } = await supabase
    .from('users')
    .select('id, line_user_id, display_name, is_admin, room_number')
    .eq('line_user_id', lineUserId)
    .single()

  if (error || !user) return c.json({ error: 'User not found' }, 401)

  c.set('user', user as User)
  await next()
})

export const adminMiddleware = createMiddleware<UserVar>(async (c, next) => {
  const user = c.get('user')
  if (!user.is_admin) return c.json({ error: 'Forbidden' }, 403)
  await next()
})
