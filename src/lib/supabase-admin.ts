import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = serviceRoleKey
  ? createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          fetch: async (url, options = {}) => {
            const headers = new Headers(options.headers)
            headers.set('apikey', serviceRoleKey)
            headers.set('Authorization', `Bearer ${serviceRoleKey}`)
            headers.set('Accept', 'application/json')
            headers.set('Content-Type', 'application/json')
            headers.set('Prefer', 'return=representation')

            const response = await fetch(url, {
              ...options,
              headers
            })

            // If we get a 406, retry with different accept header
            if (response.status === 406) {
              headers.set('Accept', '*/*')
              return fetch(url, {
                ...options,
                headers
              })
            }

            return response
          }
        },
        db: {
          schema: 'public'
        }
      }
    )
  : null 