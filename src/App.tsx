import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'

import AuthForm from './components/AuthForm'
import MainLayout from './components/MainLayout'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    const handleStorageChange = () => {
      if (localStorage.getItem('dev_bypass_auth') === 'true') {
        // Create a fake session
        setSession({
          access_token: 'fake',
          refresh_token: 'fake',
          expires_in: 3600,
          expires_at: Date.now() + 3600,
          token_type: 'bearer',
          user: { id: 'fake-user-id', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' }
        })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    // Check initially
    handleStorageChange()

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-neon-cyan animate-spin" />
      </div>
    )
  }

  return (
    <>
      <MainLayout />
    </>
  )
}
