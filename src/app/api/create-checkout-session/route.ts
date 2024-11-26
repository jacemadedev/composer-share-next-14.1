import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    let email = userEmail

    if (!email && supabaseAdmin) {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!authError && user?.email) {
        email = user.email
      }
    }

    if (!email) {
      console.warn('No email found for user:', userId)
    }

    // Create or retrieve customer first
    let customer: Stripe.Customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      // Update metadata if needed
      if (!customer.metadata.userId) {
        customer = await stripe.customers.update(customer.id, {
          metadata: { userId }
        })
      }
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: { userId }
      })
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      client_reference_id: userId,
      customer: customer.id,
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' }, 
      { status: 500 }
    )
  }
}

