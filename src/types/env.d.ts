declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      // Add other environment variables as needed
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID: string
      NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID: string
      NEXT_PUBLIC_BASE_URL: string
    }
  }
  
  