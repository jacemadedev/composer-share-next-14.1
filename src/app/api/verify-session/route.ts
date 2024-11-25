import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function GET(req: Request) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { 
      status: 400,
      headers 
    })
  }

  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return NextResponse.json({ error: 'Configuration error' }, { 
      status: 500,
      headers 
    })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      if (userId) {
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({ 
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date(subscription.created * 1000).toISOString(),
            ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          })

        if (error) {
          console.error('Error updating subscription status:', error)
          return NextResponse.json({ error: 'Failed to update subscription status' }, { 
            status: 500,
            headers 
          })
        }
      }

      return NextResponse.json({ success: true }, { headers })
    } else {
      return NextResponse.json({ error: 'Payment not completed' }, { 
        status: 400,
        headers 
      })
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { 
      status: 500,
      headers 
    })
  }
}

