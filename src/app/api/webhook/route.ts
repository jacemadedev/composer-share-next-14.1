import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      if (checkoutSession.client_reference_id) {
        await handleSuccessfulSubscription(checkoutSession)
      }
      break

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(updatedSubscription)
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCancellation(deletedSubscription)
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      await handleSuccessfulPayment(invoice)
      break

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice
      await handleFailedPayment(failedInvoice)
      break

    case 'customer.subscription.trial_will_end':
      const trialEndingSubscription = event.data.object as Stripe.Subscription
      await handleTrialEnding(trialEndingSubscription)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  const { error } = await supabase
    .from('subscriptions')
    .upsert({ 
      user_id: session.client_reference_id!, 
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
    console.error('Error updating user subscription status:', error)
    throw new Error('Failed to update subscription status')
  }

  const { error: settingsError } = await supabase
    .from('user_settings')
    .update({ 
      plan: 'premium',
      is_premium: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', session.client_reference_id!)

  if (settingsError) {
    console.error('Error updating user settings:', settingsError)
    throw new Error('Failed to update user settings')
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { error } = await supabase
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
  const { error } = await supabase
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

  const { error: settingsError } = await supabase
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

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionUpdate(subscription)
  }
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionUpdate(subscription)
  }
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  // You might want to notify the user that their trial is ending soon
  console.log(`Trial ending soon for subscription ${subscription.id}`)
}

