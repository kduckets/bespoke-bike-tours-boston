// src/app/admin/bookings/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { format } from 'date-fns'
import { formatPrice, formatTime } from '@/lib/utils'
import { RefundModal } from '@/components/admin/RefundModal'
import { BookingsFilter } from '@/components/admin/BookingsFilter'

const STATUS_BADGE: Record<BookingStatus, string> = {
  CONFIRMED:          'badge badge-confirmed',
  PENDING:            'badge badge-pending',
  CANCELLED:          'badge badge-cancelled',
  REFUNDED:           'badge badge-refunded',
  PARTIALLY_REFUNDED: 'badge badge-refunded',
  NO_SHOW:            'badge badge-cancelled',
}

async function getBookings(status?: string, page = 1) {
  const limit = 20
  const where = status && status !== 'ALL' ? { status: status as BookingStatus } : {}

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { slot: { include: { tour: true } }, promoCode: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ])

  return { bookings, total, page, limit }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const { bookings, total, limit } = await getBookings(
    searchParams.status,
    Number(searchParams.page ?? 1)
  )
  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl tracking-wide">BOOKINGS</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{total} total</span>
          <a
            href="/api/admin/bookings/export"
            className="btn-ghost"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter tabs */}
      <BookingsFilter active={searchParams.status ?? 'ALL'} />

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Ref', 'Guest', 'Tour', 'Date', 'Guests', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h}
                      className="text-left px-5 py-3.5 text-[11px] tracking-[1px] uppercase text-muted
                                 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted text-sm">
                    No bookings found.
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-muted text-xs font-mono">{b.reference}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold">{b.firstName} {b.lastName}</div>
                    <div className="text-xs text-muted">{b.email}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">{b.slot.tour.name}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm">
                    {format(new Date(b.slot.date), 'MMM d, yyyy')}
                    <div className="text-xs text-muted">{formatTime(b.slot.startTime)}</div>
                  </td>
                  <td className="px-5 py-4 text-center">{b.guestCount}</td>
                  <td className="px-5 py-4 whitespace-nowrap font-medium">
                    {formatPrice(b.totalCents, true)}
                    {b.discountCents > 0 && (
                      <div className="text-xs text-green-400">
                        -{formatPrice(b.discountCents, true)} promo
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={STATUS_BADGE[b.status]}>
                      {b.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/bookings/${b.id}`} className="btn-ghost py-1.5 px-3 text-xs">
                        View
                      </Link>
                      {(b.status === BookingStatus.CONFIRMED ||
                        b.status === BookingStatus.PARTIALLY_REFUNDED) &&
                        b.stripeChargeId && (
                          <RefundModal bookingId={b.id} reference={b.reference} totalCents={b.totalCents} />
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <span className="text-xs text-muted">Page 1 of {totalPages}</span>
            <div className="flex gap-2">
              <a href="?page=1" className="btn-ghost py-1.5 px-3 text-xs">← Prev</a>
              <a href={`?page=2`} className="btn-ghost py-1.5 px-3 text-xs">Next →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
