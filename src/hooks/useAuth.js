import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pick up any existing session (including magic-link token in URL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: {
        // After clicking the link, land back on the app
        emailRedirectTo: window.location.origin + window.location.pathname,
        shouldCreateUser: true,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithEmail, signOut }
}
