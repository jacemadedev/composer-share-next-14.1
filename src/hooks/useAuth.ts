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

  // Extract subscription fetching logic
  const fetchSubscription = async (userId: string, mounted: boolean) => {
    try {
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
      }
      
      if (mounted) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Error in subscription fetch:', error)
      if (mounted) {
        setSubscription(null)
      }
    }
  }

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted && session?.user) {
          const localUser: LocalUser = {
            id: session.user.id,
            email: session.user.email || '',
            // ... map other properties
          }
          setUser(localUser)
          await fetchSubscription(session.user.id, mounted)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const localUser: LocalUser = {
            id: session.user.id,
            email: session.user.email || '',
          }
          setUser(localUser)
          await fetchSubscription(session.user.id, mounted)
        } else {
          setUser(null)
          setSubscription(null)
        }
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, subscription }
}

