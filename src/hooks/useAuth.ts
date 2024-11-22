import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Define our local User type
interface LocalUser {
  id: string;
  email: string;
  // ... other properties
}

// Define subscription type
interface Subscription {
  status: string;
  // ... other subscription properties
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearAllStorage = () => {
    // Clear all storage related to auth
    localStorage.clear()
    sessionStorage.clear()
    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
  }

  const resetAuth = useCallback(async () => {
    try {
      clearAllStorage()
      await supabase.auth.signOut({ scope: 'global' })
      setUser(null)
      setSubscription(null)
      setError(null)
      setLoading(false)
      window.location.reload()
    } catch (error) {
      console.error('Error resetting auth:', error)
    }
  }, [])

  const fetchSubscription = async (userId: string, mounted: boolean) => {
    if (!userId) return
    try {
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (subError) {
        console.error('Subscription fetch error:', subError)
      }
      
      if (mounted) {
        setSubscription(subscriptionData || null)
      }
    } catch (error) {
      console.error('Subscription fetch error:', error)
      if (mounted) {
        setSubscription(null)
      }
    }
  }

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (mounted) {
          if (session?.user) {
            console.log('User found:', session.user.email)
            setUser({
              id: session.user.id,
              email: session.user.email || '',
            })
            await fetchSubscription(session.user.id, mounted)
          } else {
            console.log('No user found')
            setUser(null)
            setSubscription(null)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        if (mounted) {
          await resetAuth()
        }
      }
    }

    // Set a timeout to reset auth if initial session fetch takes too long
    const timeoutId = setTimeout(() => {
      if (loading && mounted) {
        console.log('Session fetch timeout - resetting auth')
        resetAuth()
      }
    }, 10000) // 10 second timeout

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (mounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
            })
            await fetchSubscription(session.user.id, mounted)
          } else {
            setUser(null)
            setSubscription(null)
          }
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      authListener.subscription.unsubscribe()
    }
  }, [loading, resetAuth])

  return { 
    user, 
    loading, 
    subscription, 
    error,
    resetAuth,
    refreshSubscription: () => user && fetchSubscription(user.id, true)
  }
}

