// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { confirmBooking } from '@/lib/bookings'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmation } from '@/lib/email'
import type Stripe from 'stripe'

// Stripe requires the raw body for signature verification
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      // chargeId is on the latest_charge field
      const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id ?? ''
      await confirmBooking(pi.id, chargeId)

      // Send confirmation email
      const booking = await prisma.booking.findUnique({
        where: { stripePaymentIntentId: pi.id },
        include: { slot: { include: { tour: true } }, promoCode: true },
      })
      if (booking) await sendBookingConfirmation(booking)
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      console.warn('Payment failed for intent:', pi.id)
      // Optionally mark booking as failed / notify customer
      break
    }
  }

  return NextResponse.json({ received: true })
}
