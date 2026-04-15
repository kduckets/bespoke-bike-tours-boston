// src/app/admin/page.tsx
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { BikeWheelSpinner } from '@/components/ui/BikeWheelSpinner'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays, startOfDay, format } from 'date-fns'
import { BookingStatus } from '@prisma/client'
import { formatPrice, formatTime } from '@/lib/utils'
import Link from 'next/link'

// ── Cached data fetchers ──────────────────────────────────────────────────────

const getStatCards = unstable_cache(
  async () => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const activeStatuses = { in: [BookingStatus.CONFIRMED, BookingStatus.PARTIALLY_REFUNDED] }

    const [revenueAgg, ridersAgg, bookingsThisMonth] = await Promise.all([
      prisma.booking.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd }, status: activeStatuses },
        _sum: { totalCents: true },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd }, status: activeStatuses },
        _sum: { guestCount: true },
      }),
      prisma.booking.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
    ])

    return {
      revenueThisMonth: revenueAgg._sum.totalCents ?? 0,
      ridersThisMonth: ridersAgg._sum.guestCount ?? 0,
      bookingsThisMonth,
    }
  },
  ['admin-stat-cards'],
  { revalidate: 30, tags: ['admin-stats'] }
)

const getRecentBookings = unstable_cache(
  async () =>
    prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, status: true,
        totalCents: true, guestCount: true,
        slot: { select: { date: true, startTime: true, tour: { select: { name: true } } } },
      },
    }),
  ['admin-recent-bookings'],
  { revalidate: 30, tags: ['admin-stats'] }
)

const getUpcomingSlots = unstable_cache(
  async () => {
    const now = new Date()
    const activeStatuses = { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] }
    const slots = await prisma.timeSlot.findMany({
      where: { isActive: true, date: { gte: startOfDay(now), lte: addDays(now, 14) } },
      select: {
        id: true, date: true, startTime: true, capacity: true,
        tour: { select: { name: true } },
        _count: { select: { bookings: { where: { status: activeStatuses } } } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 8,
    })
    return slots.map(s => ({ ...s, bookedCount: s._count.bookings, availableCount: s.capacity - s._count.bookings }))
  },
  ['admin-upcoming-slots'],
  { revalidate: 30, tags: ['admin-stats'] }
)

// ── Section components (stream independently) ────────────────────────────────

const STATUS_BADGE: Record<BookingStatus, string> = {
  CONFIRMED:          'badge badge-confirmed',
  PENDING:            'badge badge-pending',
  CANCELLED:          'badge badge-cancelled',
  REFUNDED:           'badge badge-refunded',
  PARTIALLY_REFUNDED: 'badge badge-refunded',
  NO_SHOW:            'badge badge-cancelled',
}

async function StatCards() {
  const stats = await getStatCards()
  const CARDS = [
    { label: 'Revenue (Month)', value: formatPrice(stats.revenueThisMonth, true), trend: '↑ 18%' },
    { label: 'Bookings',        value: String(stats.bookingsThisMonth),            trend: '↑ 12%' },
    { label: 'Riders',          value: String(stats.ridersThisMonth),              trend: null },
    { label: 'Avg Rating',      value: '4.9 ★',                                   trend: null, gold: true },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {CARDS.map((s) => (
        <div key={s.label} className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-2">{s.label}</div>
          <div className={`font-display text-4xl tracking-wide leading-none mb-1 ${s.gold ? 'text-gold' : ''}`}>
            {s.value}
          </div>
          {s.trend && <div className="text-xs text-green-400">{s.trend} vs last month</div>}
        </div>
      ))}
    </div>
  )
}

async function RecentBookings() {
  const bookings = await getRecentBookings()
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[11px] tracking-[2px] uppercase text-muted">Recent Bookings</div>
        <Link href="/admin/bookings" className="text-xs text-gold hover:underline">View all →</Link>
      </div>
      <div className="space-y-3">
        {bookings.length === 0 && <p className="text-sm text-muted py-4 text-center">No bookings yet.</p>}
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-md">
            <div>
              <div className="font-semibold text-sm">{b.firstName} {b.lastName}</div>
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
  )
}

async function UpcomingCapacity() {
  const slots = await getUpcomingSlots()
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[11px] tracking-[2px] uppercase text-muted">Upcoming Capacity</div>
        <Link href="/admin/availability" className="text-xs text-gold hover:underline">Manage →</Link>
      </div>
      <div className="space-y-4">
        {slots.length === 0 && <p className="text-sm text-muted py-4 text-center">No upcoming slots.</p>}
        {slots.map((slot) => {
          const pct = Math.round((slot.bookedCount / slot.capacity) * 100)
          const barColor = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-gold' : 'bg-green-500'
          return (
            <div key={slot.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span>
                  {format(new Date(slot.date), 'MMM d')} · {formatTime(slot.startTime)} ·{' '}
                  <span className="text-muted">{slot.tour.name}</span>
                </span>
                <span className={pct >= 100 ? 'text-red-400' : pct >= 75 ? 'text-gold' : 'text-green-400'}>
                  {slot.bookedCount}/{slot.capacity}
                </span>
              </div>
              <div className="capacity-bar-track">
                <div className={`capacity-bar-fill ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="card p-6 flex items-center justify-center h-[88px]">
          <BikeWheelSpinner size={32} className="text-gold/40" />
        </div>
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="card p-6 h-80 flex items-center justify-center">
      <BikeWheelSpinner size={48} className="text-gold/40" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl tracking-wide">DASHBOARD</h1>
        <span className="text-sm text-muted">{format(new Date(), 'MMMM yyyy')}</span>
      </div>

      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<GridSkeleton />}>
          <RecentBookings />
        </Suspense>
        <Suspense fallback={<GridSkeleton />}>
          <UpcomingCapacity />
        </Suspense>
      </div>
    </div>
  )
}
