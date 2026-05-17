import { Hono } from 'hono'
import { supabase } from '../lib/supabase.js'

export const usersRouter = new Hono()

// POST /users/sync — LIFFプロフィールをDBにupsert（is_adminは変更しない）
usersRouter.post('/sync', async (c) => {
  const body = await c.req.json<{
    line_user_id: string
    display_name: string
    room_number?: string
  }>()

  const { line_user_id, display_name, room_number } = body
  if (!line_user_id || !display_name) {
    return c.json({ error: 'line_user_id and display_name are required' }, 400)
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(
      { line_user_id, display_name, ...(room_number ? { room_number } : {}) },
      { onConflict: 'line_user_id', ignoreDuplicates: false }
    )
    .select('id, line_user_id, display_name, is_admin, room_number')
    .single()

  if (error) {
    console.error('users/sync error:', error.code, error.message, error.details)
    return c.json({ error: error.message }, 500)
  }
  return c.json(data)
})
