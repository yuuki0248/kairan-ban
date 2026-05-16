import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type User = {
  id: string
  line_user_id: string
  display_name: string
  is_admin: boolean
  room_number: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lineUserId = sessionStorage.getItem('line_user_id')
    if (!lineUserId) {
      setLoading(false)
      return
    }

    supabase
      .from('users')
      .select('id, line_user_id, display_name, is_admin, room_number')
      .eq('line_user_id', lineUserId)
      .single()
      .then(({ data }) => {
        setUser(data as User | null)
        setLoading(false)
      })
  }, [])

  return { user, loading }
}
