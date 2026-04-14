// src/app/api/admin/bookings/[id]/refund/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { issueRefund } from '@/lib/stripe'
import { sendRefundConfirmation } from '@/lib/email'
import { BookingStatus, RefundType } from '@prisma/client'
import { z } from 'zod'

const RefundSchema = z.object({
  type: z.enum(['FULL', 'PARTIAL', 'CREDIT']),
  amountCents: z.number().int().positive().optional(),
  reason: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, amountCents, reason } = RefundSchema.parse(body)

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { slot: { include: { tour: true } }, promoCode: true },
  })

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (!booking.stripeChargeId) return NextResponse.json({ error: 'No charge found for this booking' }, { status: 400 })

  const refundAmount = type === 'FULL' ? booking.totalCents : amountCents

  let stripeRefundId: string | undefined
  if (type !== 'CREDIT') {
    const stripeRefund = await issueRefund(booking.stripeChargeId, refundAmount)
    stripeRefundId = stripeRefund.id
  }

  await prisma.$transaction([
    prisma.refund.create({
      data: {
        bookingId: booking.id,
        amountCents: refundAmount ?? booking.totalCents,
        reason,
        stripeRefundId,
        type: type as RefundType,
        issuedBy: session.user?.email ?? 'admin',
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: type === 'FULL' ? BookingStatus.REFUNDED : BookingStatus.PARTIALLY_REFUNDED,
      },
    }),
  ])

  await sendRefundConfirmation(booking, refundAmount ?? booking.totalCents)

  return NextResponse.json({ success: true })
}
