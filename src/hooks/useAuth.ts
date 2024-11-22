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

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      try {
        setLoading(true)
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
          
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          setSubscription(subscriptionData)
        }
      } catch (error) {
        console.error('Error getting session:', error)
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
            // ... map other properties
          }
          setUser(localUser)
          
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          setSubscription(subscriptionData)
        } else {
          setUser(null)
          setSubscription(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, subscription }
}

