// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays, startOfDay, format } from 'date-fns'
import { BookingStatus } from '@prisma/client'
import { formatPrice, formatTime } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const activeStatuses = { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } as const

  const [revenueAgg, ridersAgg, bookingsThisMonth, recentBookings, upcomingSlots] =
    await Promise.all([
      prisma.booking.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd }, status: { in: [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_REFUNDED] } },
        _sum: { totalCents: true },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd }, status: { in: [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_REFUNDED] } },
        _sum: { guestCount: true },
      }),
      prisma.booking.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { slot: { include: { tour: true } }, promoCode: true },
      }),
      prisma.timeSlot.findMany({
        where: { isActive: true, date: { gte: startOfDay(now), lte: addDays(now, 14) } },
        include: {
          tour: true,
          _count: { select: { bookings: { where: { status: activeStatuses } } } },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 8,
      }),
    ])

  return {
    revenueThisMonth: revenueAgg._sum.totalCents ?? 0,
    ridersThisMonth: ridersAgg._sum.guestCount ?? 0,
    bookingsThisMonth,
    recentBookings,
    upcomingSlots: upcomingSlots.map((s) => ({
      ...s,
      bookedCount: s._count.bookings,
      availableCount: s.capacity - s._count.bookings,
    })),
  }
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  CONFIRMED:          'badge badge-confirmed',
  PENDING:            'badge badge-pending',
  CANCELLED:          'badge badge-cancelled',
  REFUNDED:           'badge badge-refunded',
  PARTIALLY_REFUNDED: 'badge badge-refunded',
  NO_SHOW:            'badge badge-cancelled',
}

export default async function AdminOverviewPage() {
  const stats = await getStats()

  const STAT_CARDS = [
    { label: 'Revenue (Month)', value: formatPrice(stats.revenueThisMonth, true), trend: '↑ 18%' },
    { label: 'Bookings',        value: String(stats.bookingsThisMonth),            trend: '↑ 12%' },
    { label: 'Riders',          value: String(stats.ridersThisMonth),              trend: null },
    { label: 'Avg Rating',      value: '4.9 ★',                                   trend: null, gold: true },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl tracking-wide">DASHBOARD</h1>
        <span className="text-sm text-muted">{format(new Date(), 'MMMM yyyy')}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] tracking-[2px] uppercase text-muted mb-2">{s.label}</div>
            <div className={`font-display text-4xl tracking-wide leading-none mb-1 ${s.gold ? 'text-gold' : ''}`}>
              {s.value}
            </div>
            {s.trend && (
              <div className="text-xs text-green-400">{s.trend} vs last month</div>
            )}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted">Recent Bookings</div>
            <Link href="/admin/bookings" className="text-xs text-gold hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentBookings.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No bookings yet.</p>
            )}
            {stats.recentBookings.map((b) => (
              <div key={b.id}
                   className="flex items-center justify-between p-4 bg-white/[0.03]
                               border border-white/[0.05] rounded-md">
                <div>
                  <div className="font-semibold text-sm">
                    {b.firstName} {b.lastName}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {b.slot.tour.name} · {format(new Date(b.slot.date), 'MMM d')} · {b.guestCount} guests
                  </div>
                </div>
                <div className="text-right">
                  <span className={STATUS_BADGE[b.status]}>{b.status.toLowerCase()}</span>
                  <div className="text-xs text-muted mt-1">{formatPrice(b.totalCents, true)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[11px] tracking-[2px] uppercase text-muted">Upcoming Capacity</div>
            <Link href="/admin/availability" className="text-xs text-gold hover:underline">Manage →</Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingSlots.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No upcoming slots.</p>
            )}
            {stats.upcomingSlots.map((slot) => {
              const pct = Math.round((slot.bookedCount / slot.capacity) * 100)
              const barColor =
                pct >= 100 ? 'bg-red-500' :
                pct >= 75  ? 'bg-gold' :
                              'bg-green-500'

              return (
                <div key={slot.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>
                      {format(new Date(slot.date), 'MMM d')} ·{' '}
                      {formatTime(slot.startTime)} ·{' '}
                      <span className="text-muted">{slot.tour.name}</span>
                    </span>
                    <span className={pct >= 100 ? 'text-red-400' : pct >= 75 ? 'text-gold' : 'text-green-400'}>
                      {slot.bookedCount}/{slot.capacity}
                    </span>
                  </div>
                  <div className="capacity-bar-track">
                    <div
                      className={`capacity-bar-fill ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
