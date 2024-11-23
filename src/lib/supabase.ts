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

// Create a separate instance for auth operations
export const supabaseAuth = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
})

// Main client for data operations
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
    fetch: async (url, options = {}) => {
      const { data: { session } } = await supabaseAuth.auth.getSession()
      
      const headers = new Headers(options.headers)
      if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
      }
      headers.set('apikey', supabaseAnonKey)
      headers.set('Accept', 'application/json')
      headers.set('Content-Type', 'application/json')
      headers.set('Prefer', 'return=representation')

      return fetch(url, {
        ...options,
        headers
      })
    }
  }
})

