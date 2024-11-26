import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        const customerResponse = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const userId = customerResponse.metadata?.userId || subscription.metadata.userId

        if (!userId) {
          console.error('No userId found in customer or subscription metadata:', {
            customerId,
            subscriptionId: subscription.id
          })
          throw new Error('No userId found in metadata')
        }

        const status = subscription.status
        const cancelAtPeriodEnd = subscription.cancel_at_period_end
        const priceId = subscription.items.data[0]?.price.id || ''

        console.log('Processing subscription:', {
          subscriptionId: subscription.id,
          userId,
          status,
          customerId
        })

        const { error: subscriptionError } = await supabaseAdmin!
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            customer_id: customerId,
            status,
            price_id: priceId,
            cancel_at_period_end: cancelAtPeriodEnd,
            created_at: new Date(subscription.created * 1000).toISOString(),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            quantity: subscription.items.data[0]?.quantity || 1
          })

        if (subscriptionError) {
          console.error('Subscription update error:', subscriptionError)
          throw subscriptionError
        }

        if (status === 'active' && !cancelAtPeriodEnd) {
          const { error: settingsError } = await supabaseAdmin!
            .from('user_settings')
            .update({
              plan: 'premium',
              is_premium: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

          if (settingsError) {
            console.error('Settings update error:', settingsError)
            throw settingsError
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const customerResponse = await stripe.customers.retrieve(customerId) as Stripe.Customer
        const userId = customerResponse.metadata?.userId || subscription.metadata.userId

        if (!userId) {
          console.error('No userId found for deleted subscription:', {
            customerId,
            subscriptionId: subscription.id
          })
          throw new Error('No userId found in metadata')
        }

        const { error: updateError } = await supabaseAdmin!
          .from('user_settings')
          .update({
            plan: 'free',
            is_premium: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) throw updateError
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    )
  }
}

