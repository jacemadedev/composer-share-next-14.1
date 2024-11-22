import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id

      if (userId) {
        // Update user's subscription status in Supabase
        const { error } = await supabase
          .from('user_settings')
          .upsert({ user_id: userId, is_premium: true })

        if (error) {
          console.error('Error updating user subscription status:', error)
          return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
  }
}

