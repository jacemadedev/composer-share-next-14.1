import { useState, useEffect } from 'react'
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

  const fetchSubscription = async (userId: string, mounted: boolean) => {
    if (!userId) return

    try {
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (subError && subError.code !== 'PGRST116') {
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

    // First, check for an existing session in localStorage
    const existingSession = supabase.auth.session()
    
    if (existingSession?.user) {
      setUser({
        id: existingSession.user.id,
        email: existingSession.user.email || '',
      })
      fetchSubscription(existingSession.user.id, mounted)
    }

    async function getInitialSession() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

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
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to get session')
          setUser(null)
          setSubscription(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
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
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Add a method to force refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
        await fetchSubscription(session.user.id, true)
      } else {
        setUser(null)
        setSubscription(null)
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh session')
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, subscription, error, refreshSession }
}

