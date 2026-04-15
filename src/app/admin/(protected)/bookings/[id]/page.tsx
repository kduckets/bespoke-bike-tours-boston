// src/app/admin/bookings/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatTime } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'
import { RefundModal } from '@/components/admin/RefundModal'

async function getBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      slot:      { include: { tour: true } },
      promoCode: true,
      refunds:   { orderBy: { issuedAt: 'desc' } },
    },
  })
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  CONFIRMED:          'badge badge-confirmed',
  PENDING:            'badge badge-pending',
  CANCELLED:          'badge badge-cancelled',
  REFUNDED:           'badge badge-refunded',
  PARTIALLY_REFUNDED: 'badge badge-refunded',
  NO_SHOW:            'badge badge-cancelled',
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await getBooking(id)
  if (!booking) notFound()

  const canRefund =
    (booking.status === BookingStatus.CONFIRMED ||
     booking.status === BookingStatus.PARTIALLY_REFUNDED) &&
    !!booking.stripeChargeId

  const totalRefunded = booking.refunds.reduce((sum, r) => sum + r.amountCents, 0)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/bookings" className="text-muted hover:text-white transition-colors text-sm">
          ← All Bookings
        </Link>
        <span className="text-white/20">/</span>
        <span className="font-mono text-sm text-gold">{booking.reference}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-4xl tracking-wide mb-1">
            {booking.firstName} {booking.lastName}
          </h1>
          <div className="flex items-center gap-3">
            <span className={STATUS_BADGE[booking.status]}>
              {booking.status.toLowerCase().replace('_', ' ')}
            </span>
            <span className="text-sm text-muted">
              Booked {format(new Date(booking.createdAt), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        </div>
        {canRefund && (
          <RefundModal
            bookingId={booking.id}
            reference={booking.reference}
            totalCents={booking.totalCents}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Tour details */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-4">Tour</div>
          <div className="space-y-0">
            {[
              ['Tour',       booking.slot.tour.name],
              ['Date',       format(new Date(booking.slot.date), 'EEEE, MMMM d, yyyy')],
              ['Time',       formatTime(booking.slot.startTime)],
              ['Duration',   booking.slot.tour.duration],
              ['Guests',     String(booking.guestCount)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 text-sm border-b border-white/[0.05] last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment details */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-4">Payment</div>
          <div className="space-y-0">
            {[
              ['Subtotal',    formatPrice(booking.subtotalCents, true)],
              ...(booking.discountCents > 0
                ? [['Discount', `−${formatPrice(booking.discountCents, true)}`]] as [string, string][]
                : []),
              ['Total Paid', formatPrice(booking.totalCents, true)],
              ...(totalRefunded > 0
                ? [['Refunded', `−${formatPrice(totalRefunded, true)}`]] as [string, string][]
                : []),
              ['Net',        formatPrice(booking.totalCents - totalRefunded, true)],
            ].map(([label, value]) => (
              <div key={label} className={[
                'flex justify-between py-2.5 text-sm border-b border-white/[0.05] last:border-0',
                label === 'Net' ? 'font-bold text-gold' : '',
              ].join(' ')}>
                <span className={label === 'Net' ? '' : 'text-muted'}>{label}</span>
                <span className={label === 'Refunded' ? 'text-red-400' : ''}>{value}</span>
              </div>
            ))}
            {booking.promoCode && (
              <div className="flex justify-between py-2.5 text-sm border-t border-white/[0.05]">
                <span className="text-muted">Promo Code</span>
                <span className="font-mono text-gold text-xs bg-gold/10 px-2 py-0.5 rounded">
                  {booking.promoCode.code}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Guest info */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-4">Guest</div>
          <div className="space-y-0">
            {[
              ['Name',  `${booking.firstName} ${booking.lastName}`],
              ['Email', booking.email],
              ['Phone', booking.phone],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 text-sm border-b border-white/[0.05] last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-medium truncate ml-4">{value}</span>
              </div>
            ))}
          </div>
          {booking.specialRequests && (
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="text-[11px] tracking-[2px] uppercase text-muted mb-2">Special Requests</div>
              <p className="text-sm text-white/80 leading-relaxed">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Stripe info */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-4">Stripe</div>
          <div className="space-y-3">
            {booking.stripePaymentIntentId && (
              <div>
                <div className="text-[10px] tracking-[1px] uppercase text-muted mb-1">Payment Intent</div>
                <a
                  href={`https://dashboard.stripe.com/payments/${booking.stripePaymentIntentId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-iris-2 hover:text-white truncate block"
                >
                  {booking.stripePaymentIntentId} ↗
                </a>
              </div>
            )}
            {booking.stripeChargeId && (
              <div>
                <div className="text-[10px] tracking-[1px] uppercase text-muted mb-1">Charge</div>
                <a
                  href={`https://dashboard.stripe.com/charges/${booking.stripeChargeId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-iris-2 hover:text-white truncate block"
                >
                  {booking.stripeChargeId} ↗
                </a>
              </div>
            )}
            {!booking.stripePaymentIntentId && (
              <p className="text-sm text-muted">No payment recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Refund history */}
      {booking.refunds.length > 0 && (
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-4">Refund History</div>
          <div className="space-y-3">
            {booking.refunds.map((r) => (
              <div key={r.id} className="flex items-start justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-md">
                <div>
                  <div className="text-sm font-semibold capitalize">{r.type.toLowerCase()} refund</div>
                  <div className="text-xs text-muted mt-0.5">{r.reason}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {format(new Date(r.issuedAt), 'MMM d, yyyy · h:mm a')} · by {r.issuedBy}
                  </div>
                  {r.stripeRefundId && (
                    <a
                      href={`https://dashboard.stripe.com/refunds/${r.stripeRefundId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="font-mono text-xs text-iris-2 hover:text-white mt-1 block"
                    >
                      {r.stripeRefundId} ↗
                    </a>
                  )}
                </div>
                <div className="text-red-400 font-semibold text-sm shrink-0 ml-4">
                  −{formatPrice(r.amountCents, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
