// src/app/api/admin/bookings/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { format } from 'date-fns'
import { formatTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const bookings = await prisma.booking.findMany({
    where: status && status !== 'ALL' && Object.values(BookingStatus).includes(status as BookingStatus)
      ? { status: status as BookingStatus }
      : {},
    include: { slot: { include: { tour: true } }, promoCode: true },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'Reference',
    'Status',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Tour',
    'Date',
    'Time',
    'Guests',
    'Subtotal',
    'Discount',
    'Total',
    'Promo Code',
    'Special Requests',
    'Created At',
  ]

  const rows = bookings.map((b) => [
    b.reference,
    b.status,
    b.firstName,
    b.lastName,
    b.email,
    b.phone,
    b.slot.tour.name,
    format(new Date(b.slot.date), 'yyyy-MM-dd'),
    formatTime(b.slot.startTime),
    b.guestCount,
    (b.subtotalCents / 100).toFixed(2),
    (b.discountCents / 100).toFixed(2),
    (b.totalCents / 100).toFixed(2),
    b.promoCode?.code ?? '',
    (b.specialRequests ?? '').replace(/,/g, ';'), // escape commas
    format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm'),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bbt-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
    },
  })
}
