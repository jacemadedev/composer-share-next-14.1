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

  // Add console logs for debugging
  useEffect(() => {
    console.log('Auth State:', { loading, user, subscription, error })
  }, [loading, user, subscription, error])

  const fetchSubscription = async (userId: string, mounted: boolean) => {
    try {
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (subError) {
        console.log('Subscription fetch error:', subError)
        // Don't treat missing subscription as an error
        if (subError.code === 'PGRST116') {
          if (mounted) setSubscription(null)
          return
        }
        throw subError
      }
      
      if (mounted) {
        setSubscription(subscriptionData)
      }
    } catch (error) {
      console.error('Subscription fetch error:', error)
      if (mounted) {
        setError(error instanceof Error ? error.message : 'Failed to fetch subscription')
        setSubscription(null)
      }
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('useAuth effect running')

    async function getInitialSession() {
      try {
        console.log('Fetching initial session...')
        setLoading(true)
        
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        console.log('Session retrieved:', session)

        if (mounted) {
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
          console.log('Initial session load complete')
        }
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (mounted) {
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
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('useAuth cleanup running')
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, subscription, error }
}

