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
      // Add cache-busting query parameter
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
        .throwOnError()
      
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
    let timeoutId: NodeJS.Timeout

    async function getInitialSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

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
          // Add a small delay before setting loading to false
          timeoutId = setTimeout(() => {
            if (mounted) {
              setLoading(false)
            }
          }, 500)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to get session')
          setUser(null)
          setSubscription(null)
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
      if (timeoutId) clearTimeout(timeoutId)
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Add a method to manually refresh subscription
  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id, true)
    }
  }

  return { user, loading, subscription, error, refreshSubscription }
}

