import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Add OPTIONS method handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` },
        { status: 400 }
      )
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          console.log('Processing checkout.session.completed:', checkoutSession.id)
          
          if (!checkoutSession.client_reference_id) {
            throw new Error('No client_reference_id found in checkout session')
          }
          
          if (!checkoutSession.subscription) {
            throw new Error('No subscription found in checkout session')
          }
          
          await handleSuccessfulSubscription(checkoutSession)
          break
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          console.log('Processing subscription update:', subscription.id)
          
          if (!subscription.customer) {
            throw new Error('No customer found in subscription')
          }
          
          await handleSubscriptionUpdate(subscription)
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          console.log('Processing subscription deletion:', subscription.id)
          
          if (!subscription.customer) {
            throw new Error('No customer found in subscription')
          }
          
          await handleSubscriptionCancellation(subscription)
          break
        }

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error in webhook handler' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Update other method handlers to include CORS headers
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    }
  )
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  console.log('Handling successful subscription for session:', session.id)
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  console.log('Retrieved subscription:', subscription.id)

  try {
    // Get the customer ID as string
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id || null

    // First update subscription using admin client
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({ 
        user_id: session.client_reference_id!, 
        customer_id: customerId, // Use the properly typed customer ID
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

    if (subError) {
      console.error('Error updating subscription:', subError)
      throw new Error(`Failed to update subscription: ${subError.message}`)
    }

    // Then update user settings using admin client
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .update({ 
        plan: 'premium',
        is_premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.client_reference_id!)

    if (settingsError) {
      console.error('Error updating user settings:', settingsError)
      throw new Error(`Failed to update user settings: ${settingsError.message}`)
    }

    console.log('Successfully processed subscription for user:', session.client_reference_id)
  } catch (error) {
    console.error('Error in handleSuccessfulSubscription:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({ 
      user_id: subscription.customer as string,
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
    throw new Error('Failed to update subscription status')
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available')
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ 
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: new Date(subscription.canceled_at! * 1000).toISOString(),
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null
    })
    .eq('user_id', subscription.customer)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw new Error('Failed to update subscription status')
  }

  const { error: settingsError } = await supabaseAdmin
    .from('user_settings')
    .update({ 
      plan: 'free',
      is_premium: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', subscription.customer)

  if (settingsError) {
    console.error('Error updating user settings:', settingsError)
    throw new Error('Failed to update user settings')
  }
}

