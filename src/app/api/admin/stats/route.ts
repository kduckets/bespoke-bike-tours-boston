// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays, startOfDay } from 'date-fns'
import { BookingStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [revenueAgg, bookingCount, recentBookings, upcomingSlots] = await Promise.all([
    // Revenue this month (confirmed/partially-refunded bookings)
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_REFUNDED] },
      },
      _sum: { totalCents: true },
      _count: true,
    }),

    // Total bookings this month
    prisma.booking.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    }),

    // Recent bookings with details
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { slot: { include: { tour: true } }, promoCode: true },
    }),

    // Upcoming slots with booking counts (next 14 days)
    prisma.timeSlot.findMany({
      where: {
        isActive: true,
        date: { gte: startOfDay(now), lte: addDays(now, 14) },
      },
      include: {
        tour: true,
        _count: {
          select: {
            bookings: { where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
  ])

  // Total riders this month
  const ridersAgg = await prisma.booking.aggregate({
    where: {
      createdAt: { gte: monthStart, lte: monthEnd },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_REFUNDED] },
    },
    _sum: { guestCount: true },
  })

  return NextResponse.json({
    revenueThisMonth: revenueAgg._sum.totalCents ?? 0,
    bookingsThisMonth: bookingCount,
    ridersThisMonth: ridersAgg._sum.guestCount ?? 0,
    recentBookings,
    upcomingSlots: upcomingSlots.map((s) => ({
      ...s,
      bookedCount: s._count.bookings,
      availableCount: s.capacity - s._count.bookings,
    })),
  })
}
