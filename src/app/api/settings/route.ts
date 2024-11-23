import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Add rate limiting
const rateLimit = new Map<string, number>()

export async function POST(req: Request) {
  try {
    // Get authorization header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add rate limiting
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const lastRequest = rateLimit.get(ip) || 0
    if (now - lastRequest < 1000) { // 1 request per second
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    rateLimit.set(ip, now)

    // Get user from token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(authorization.replace('Bearer ', ''))
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await req.json()
    const { apiKey } = body

    // Validate API key format
    if (!apiKey?.startsWith('sk-')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
    }

    // Check if user settings exist
    const { data: existingSettings } = await supabaseAdmin!
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let error
    if (!existingSettings) {
      // Create new settings
      const { error: insertError } = await supabaseAdmin!
        .from('user_settings')
        .insert({
          user_id: user.id,
          openai_api_key: apiKey,
          plan: 'free',
          is_premium: false,
          theme: 'light',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      error = insertError
    } else {
      // Update existing settings
      const { error: updateError } = await supabaseAdmin!
        .from('user_settings')
        .update({
          openai_api_key: apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      error = updateError
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in settings API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    )
  }
}