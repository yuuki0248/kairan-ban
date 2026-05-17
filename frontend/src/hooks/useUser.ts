import { useState, useEffect } from 'react'
import { getMe, type Me } from '../lib/api'

export type User = Me

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lineUserId = sessionStorage.getItem('line_user_id')
    if (!lineUserId) {
      setLoading(false)
      return
    }

    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
