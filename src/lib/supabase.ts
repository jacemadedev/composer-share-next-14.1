import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

try {
  new URL(supabaseUrl)
} catch {
  console.error('Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
}

// Create a single instance for both auth and data operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'composer-kit'
    },
    fetch: async (url, options = {}) => {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = new Headers(options.headers)
      
      // Add auth header if we have a session
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
      }
      
      // Add API key header
      headers.set('apikey', supabaseAnonKey)
      
      // Add cache control
      headers.set('Cache-Control', 'no-cache')

      try {
        const response = await fetch(url, {
          ...options,
          headers
        })
        return response
      } catch (error) {
        console.error('Fetch error:', error)
        throw error
      }
    }
  }
})

// Export the same instance for auth operations
export const supabaseAuth = supabase

