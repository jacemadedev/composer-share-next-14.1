import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available')
    }

    // Get customer ID from subscriptions table
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError) {
      console.error('Error fetching subscription:', subError)
      throw new Error('No subscription found')
    }

    // Create Stripe customer if not exists
    let customerId = subscription?.customer_id

    if (!customerId) {
      // Get user email
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (userError || !user?.email) {
        throw new Error('User not found')
      }

      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Error creating portal session' },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 