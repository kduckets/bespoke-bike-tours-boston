// src/lib/bookings.ts
import { prisma } from './prisma'
import { createPaymentIntent } from './stripe'
import { BookingStatus, PromoType } from '@prisma/client'
import type { CreateBookingPayload, BookingResult, PromoValidation } from '@/types'
import { generateReference } from './utils'

// ─── Availability ──────────────────────────────────────────────────────────────

export async function getAvailableSlots(tourSlug?: string, from?: Date, to?: Date) {
  const now = new Date()
  return prisma.timeSlot.findMany({
    where: {
      isActive: true,
      date: {
        gte: from ?? now,
        lte: to,
      },
      tour: tourSlug ? { slug: tourSlug, isActive: true } : { isActive: true },
    },
    include: {
      tour: true,
      _count: {
        select: {
          bookings: {
            where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } },
          },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })
}

export async function getSlotById(slotId: string) {
  return prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: {
      tour: true,
      _count: {
        select: {
          bookings: {
            where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } },
          },
        },
      },
    },
  })
}

// ─── Promo Codes ───────────────────────────────────────────────────────────────

export async function validatePromoCode(
  code: string,
  subtotalCents: number
): Promise<PromoValidation> {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!promo || !promo.isActive) return { valid: false, error: 'Invalid promo code' }
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, error: 'Promo code has expired' }
  if (promo.maxUses && promo.usedCount >= promo.maxUses) return { valid: false, error: 'Promo code has reached its limit' }

  const discountCents =
    promo.type === PromoType.PERCENTAGE
      ? Math.round(subtotalCents * (promo.value / 100))
      : Math.min(promo.value, subtotalCents)

  return {
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discountCents,
  }
}

// ─── Create Booking ────────────────────────────────────────────────────────────

export async function createBooking(payload: CreateBookingPayload): Promise<BookingResult> {
  const slot = await getSlotById(payload.slotId)
  if (!slot) throw new Error('Time slot not found')

  const booked = slot._count.bookings
  if (booked + payload.guestCount > slot.capacity) {
    throw new Error(`Not enough capacity. Only ${slot.capacity - booked} spots remaining.`)
  }

  const subtotalCents = slot.tour.pricePerPerson * payload.guestCount

  // Validate and apply promo code
  let discountCents = 0
  let promoCodeId: string | undefined

  if (payload.promoCode) {
    const promo = await validatePromoCode(payload.promoCode, subtotalCents)
    if (!promo.valid) throw new Error(promo.error)
    discountCents = promo.discountCents ?? 0
    const promoRecord = await prisma.promoCode.findUnique({ where: { code: payload.promoCode.toUpperCase() } })
    promoCodeId = promoRecord?.id
  }

  const totalCents = subtotalCents - discountCents

  // Create payment intent first (before writing booking, so we can capture Stripe ID)
  const paymentIntent = await createPaymentIntent(totalCents, {
    slotId: payload.slotId,
    tourName: slot.tour.name,
    email: payload.email,
    guestCount: String(payload.guestCount),
  })

  // Create booking record in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        reference: generateReference(),
        slotId: payload.slotId,
        guestCount: payload.guestCount,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        specialRequests: payload.specialRequests,
        promoCodeId,
        subtotalCents,
        discountCents,
        totalCents,
        status: BookingStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        guestsData: payload.guestsData ? JSON.stringify(payload.guestsData) : undefined,
      },
    })

    // Increment promo usage
    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      })
    }

    return b
  })

  return {
    bookingId: booking.id,
    reference: booking.reference,
    clientSecret: paymentIntent.client_secret!,
    totalCents,
  }
}

// ─── Confirm Booking (called from Stripe webhook) ─────────────────────────────

export async function confirmBooking(paymentIntentId: string, chargeId: string) {
  await prisma.booking.update({
    where: { stripePaymentIntentId: paymentIntentId },
    data: {
      status: BookingStatus.CONFIRMED,
      stripeChargeId: chargeId,
    },
  })
}
