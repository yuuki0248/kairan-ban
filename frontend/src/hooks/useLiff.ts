import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { syncUser } from '../lib/api'

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string

export function useLiff() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    liff
      .init({ liffId: LIFF_ID })
      .then(async () => {
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        const profile = await liff.getProfile()
        sessionStorage.setItem('line_user_id', profile.userId)
        await syncUser({ line_user_id: profile.userId, display_name: profile.displayName })
        setIsReady(true)
      })
      .catch((err: unknown) => setError(String(err)))
  }, [])

  return { isReady, error }
}
