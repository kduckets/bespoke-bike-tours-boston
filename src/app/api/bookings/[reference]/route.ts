// src/app/api/bookings/[reference]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { formatTime, formatPrice } from '@/lib/utils'

export async function GET(
  _req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const booking = await prisma.booking.findUnique({
    where: { reference: params.reference },
    include: { slot: { include: { tour: true } }, promoCode: true },
  })

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Return a safe public projection (no Stripe IDs etc.)
  return NextResponse.json({
    reference:      booking.reference,
    status:         booking.status,
    firstName:      booking.firstName,
    lastName:       booking.lastName,
    email:          booking.email,
    guestCount:     booking.guestCount,
    totalCents:     booking.totalCents,
    totalFormatted: formatPrice(booking.totalCents, true),
    tour: {
      name:     booking.slot.tour.name,
      duration: booking.slot.tour.duration,
    },
    slot: {
      date:      format(new Date(booking.slot.date), 'EEEE, MMMM d, yyyy'),
      startTime: formatTime(booking.slot.startTime),
    },
    specialRequests: booking.specialRequests,
    promoCode:       booking.promoCode?.code ?? null,
  })
}
