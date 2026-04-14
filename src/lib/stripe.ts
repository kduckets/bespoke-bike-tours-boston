// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder', {
  apiVersion: '2024-06-20',
  typescript: true,
})

/**
 * Create a PaymentIntent for a booking.
 * We create the intent before confirming the booking so the UI can
 * render Stripe Elements and collect payment details securely.
 */
export async function createPaymentIntent(
  amountCents: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata,
  })
}

/**
 * Issue a full or partial refund via Stripe.
 */
export async function issueRefund(
  chargeId: string,
  amountCents?: number // omit for full refund
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    charge: chargeId,
    ...(amountCents ? { amount: amountCents } : {}),
  })
}

/**
 * Format cents to a dollar string, e.g. 7500 → "$75.00"
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
