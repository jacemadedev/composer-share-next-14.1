'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: LocalUser | null
  subscription: Subscription | null
  isLoading: boolean
  error: string | null
  resetAuth: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

interface LocalUser {
  id: string
  email: string
}

interface Subscription {
  status: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resetAuth = async () => {
    try {
      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      await supabase.auth.signOut({ scope: 'global' })
      setUser(null)
      setSubscription(null)
      setError(null)
      window.location.reload()
    } catch (error) {
      console.error('Error resetting auth:', error)
    }
  }

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (subError) throw subError
      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setSubscription(null)
    }
  }

  const refreshSubscription = async () => {
    if (!user) return Promise.resolve()
    return fetchSubscription(user.id)
  }

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        if (mounted) {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
            })
            await fetchSubscription(session.user.id)
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          setError('Failed to initialize authentication')
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          })
          await fetchSubscription(session.user.id)
        } else {
          setUser(null)
          setSubscription(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      authListener.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider 
      value={{
        user,
        subscription,
        isLoading,
        error,
        resetAuth,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 