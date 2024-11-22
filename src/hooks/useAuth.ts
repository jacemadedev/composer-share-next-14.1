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
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
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

  const resetAuth = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSubscription(null)
      setError(null)
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token')
    } catch (error) {
      console.error('Error resetting auth:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        // First try to clear any existing session that might be stuck
        const existingSession = await supabase.auth.getSession()
        if (existingSession.error) {
          await resetAuth()
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          await resetAuth()
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
          setLoading(false)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        if (mounted) {
          await resetAuth()
          setLoading(false)
        }
      }
    }

    getInitialSession()

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

  return { 
    user, 
    loading, 
    subscription, 
    error,
    resetAuth, // Export the reset function
    refreshSubscription: () => user && fetchSubscription(user.id, true)
  }
}

