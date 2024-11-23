'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase, supabaseAuth } from '@/lib/supabase'
import { initializeOrUpdateUserSettings } from '@/lib/api-utils'

interface AuthContextType {
  user: LocalUser | null
  subscription: Subscription | null
  plan: string | null
  isLoading: boolean
  error: string | null
  resetAuth: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

interface LocalUser {
  id: string
  email: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

interface Subscription {
  status: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const resetAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Sign out using the auth client
      await supabaseAuth.auth.signOut()
      
      // Clear state
      setUser(null)
      setSubscription(null)
      setPlan(null)
      setError(null)
      setIsInitialized(false)
      
      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Force a clean reload
      window.location.replace('/')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force reload even if there's an error
      window.location.replace('/')
    }
  }, [])

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Get current session
      const { data: { session } } = await supabaseAuth.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Initialize user settings with default values
      await initializeOrUpdateUserSettings(userId)

      // Then check for active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subscriptionError) {
        console.error('Subscription error:', subscriptionError)
        setSubscription(null)
        setPlan('free')
      } else if (subscriptionData?.status === 'active') {
        setSubscription(subscriptionData)
        setPlan('premium')
      } else {
        setSubscription(null)
        setPlan('free')
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err)
      setSubscription(null)
      setPlan('free')
    }
  }, [])

  const initializeUserSettings = useCallback(async (userId: string) => {
    try {
      // First check if settings exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingSettings && !fetchError) {
        // Create initial settings if they don't exist
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            plan: 'free',
            is_premium: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            theme: 'light',
            openai_api_key: null // Explicitly set to null initially
          })

        if (insertError) {
          console.error('Error creating initial user settings:', insertError)
        }
      }
    } catch (error) {
      console.error('Error initializing user settings:', error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      if (!mounted) return

      try {
        console.log('Initializing auth...')
        
        const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }

        if (!mounted) return

        if (session?.user) {
          console.log('User found:', session.user.email)
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          })
          
          // Initialize user settings before fetching data
          await initializeUserSettings(session.user.id)
          await fetchUserData(session.user.id)
        } else {
          console.log('No user found')
          setUser(null)
          setSubscription(null)
          setPlan(null)
        }
        
        setIsLoading(false)
        setIsInitialized(true)
      } catch (err) {
        console.error('Auth initialization error:', err)
        if (mounted) {
          await resetAuth()
        }
      }
    }

    // Set timeout for initialization
    const timeoutId = setTimeout(() => {
      if (!isInitialized && mounted) {
        console.log('Auth initialization timeout')
        resetAuth()
      }
    }, 5000) // Reduced timeout to 5 seconds

    // Setup auth state listener first
    const { data: { subscription: authListener } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (!mounted) return

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          })
          fetchUserData(session.user.id)
        } else {
          setUser(null)
          setSubscription(null)
          setPlan(null)
        }
        setIsLoading(false)
      }
    )

    // Then initialize auth
    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      authListener.unsubscribe()
    }
  }, [isInitialized, fetchUserData, resetAuth, initializeUserSettings])

  const refreshSubscription = async (): Promise<void> => {
    if (!user) return

    try {
      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (error) {
            throw error
          }
          
          setSubscription(data)
          if (data?.status === 'active') {
            setPlan('premium')
            try {
              await supabase
                .from('user_settings')
                .update({ 
                  plan: 'premium',
                  is_premium: true,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
            } catch (updateError) {
              console.error('Error updating user settings:', updateError)
            }
          }
          success = true
        } catch (err) {
          retryCount++
          if (retryCount === maxRetries) {
            throw err
          }
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        }
      }
    } catch (err) {
      console.error('Subscription fetch error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? err.stack : '',
        hint: 'Check network connection and Supabase service status',
        code: ''
      })
      setSubscription(null)
      // Don't change plan if we can't verify subscription
      // This prevents accidentally downgrading premium users
      // setPlan('free')
    }
  }

  // Add debug information to help diagnose issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Auth] ${message}`, data || '');
    }
  };

  debugLog('Auth state changed', {
    isLoading,
    isInitialized,
    hasUser: !!user,
    hasSubscription: !!subscription,
    plan
  });

  return (
    <AuthContext.Provider 
      value={{
        user,
        subscription,
        plan,
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