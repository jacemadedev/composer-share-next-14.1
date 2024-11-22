import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: Request) {
  try {
    const { priceId, userId } = await req.json()

    let userEmail: string | null = null

    // Try to get user email through admin client first
    if (supabaseAdmin) {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!authError && user?.email) {
        userEmail = user.email
      }
    }

    // Fallback: try to get user through auth API
    if (!userEmail) {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (!authError && session?.user?.email) {
        userEmail = session.user.email
      }
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
      metadata: {
        userId: userId,
      },
    }

    // Only add customer_email if we have it
    if (userEmail) {
      sessionConfig.customer_email = userEmail
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

