// src/app/book/confirmation/[reference]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface BookingData {
  reference: string
  firstName: string
  guestCount: number
  totalFormatted: string
  tour: { name: string; duration: string }
  slot: { date: string; startTime: string }
  specialRequests?: string
  promoCode?: string
}

async function getBooking(reference: string): Promise<BookingData | null> {
  // Server-side fetch — uses internal URL during SSR
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/bookings/${reference}`, {
    cache: 'no-store', // always fresh
  })
  if (!res.ok) return null
  return res.json()
}

export default async function ConfirmationPage({
  params,
}: {
  params: { reference: string }
}) {
  const booking = await getBooking(params.reference)
  if (!booking) notFound()

  const WHAT_TO_BRING = [
    'Comfortable clothes',
    'Closed-toe shoes',
    'Water bottle',
    'Good vibes only',
  ]

  return (
    <div className="pt-[70px] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Confirmed card */}
        <div className="card p-10 text-center mb-6">
          {/* Check icon */}
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-400
                          flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>

          <div className="text-xs tracking-[4px] uppercase text-muted mb-2">
            Booking Confirmed
          </div>
          <div className="font-display text-5xl tracking-[4px] text-gold mb-2">
            {booking.reference}
          </div>
          <p className="text-muted text-sm mb-8">
            A confirmation has been sent to your email address.
          </p>

          {/* Booking summary */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg
                          p-6 text-left mb-6">
            <div className="text-[11px] tracking-[2px] uppercase text-gold mb-4">
              Your Booking
            </div>
            <div className="space-y-0">
              {[
                ['Tour',   booking.tour.name],
                ['Date',   booking.slot.date],
                ['Time',   booking.slot.startTime],
                ['Guests', String(booking.guestCount)],
                ['Paid',   booking.totalFormatted],
                ...(booking.promoCode
                  ? [['Promo Code', booking.promoCode] as [string, string]]
                  : []),
              ].map(([label, value]) => (
                <div key={label}
                     className="flex justify-between py-2.5 text-sm
                                border-b border-white/[0.05] last:border-0">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meet up info */}
          <div className="bg-gold/5 border border-gold/20 rounded-lg p-5 text-left mb-6">
            <div className="text-[11px] tracking-[2px] uppercase text-gold mb-3">Meet Up</div>
            <p className="text-sm text-white/80 leading-relaxed">
              The Esplanade near the Hatch Shell<br />
              100 Embankment Rd, Boston, MA 02114<br /><br />
              Please arrive <strong>10 minutes early</strong>.
            </p>
          </div>

          {/* What to bring */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg
                          p-5 text-left mb-8">
            <div className="text-[11px] tracking-[2px] uppercase text-muted mb-3">
              What to Bring
            </div>
            <div className="space-y-1.5">
              {WHAT_TO_BRING.map((item) => (
                <div key={item} className="text-sm text-white/75">✦ {item}</div>
              ))}
            </div>
          </div>

          {booking.specialRequests && (
            <div className="bg-iris/5 border border-iris/20 rounded-lg p-5 text-left mb-8">
              <div className="text-[11px] tracking-[2px] uppercase text-muted mb-2">
                Your Special Requests
              </div>
              <p className="text-sm text-white/75">{booking.specialRequests}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="btn-primary">Back to Home ✦</Link>
            <Link href="/tours" className="btn-outline">Explore More Tours</Link>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="text-center text-xs text-muted leading-relaxed">
          Need to cancel or modify?{' '}
          <a href="mailto:hello@bespokebikeboston.com"
             className="text-gold hover:underline">
            hello@bespokebikeboston.com
          </a>{' '}
          at least 48 hours before your ride for a full refund.
        </div>
      </div>
    </div>
  )
}
