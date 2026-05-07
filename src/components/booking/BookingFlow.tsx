'use client'
// src/components/booking/BookingFlow.tsx
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { formatPrice } from '@/lib/utils'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import type { AvailableSlot, PromoValidation, GuestDetail } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export interface TourData {
  slug: string
  name: string
  duration: string
  maxCapacity: number
  pricePerPerson: number
  groupBasePrice: number | null
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Date', 'Your Info', 'Payment']
  return (
    <div className="flex items-center mb-10">
      {steps.map((label, i) => {
        const num = i + 1
        const isDone = num < current
        const isActive = num === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3 shrink-0">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                isDone   ? 'bg-purple-2 text-white'                         : '',
                isActive ? 'bg-gold text-navy'                              : '',
                !isDone && !isActive ? 'bg-white/10 border border-white/20 text-muted' : '',
              ].join(' ')}>
                {isDone ? '✓' : num}
              </div>
              <span className={['text-xs tracking-widests uppercase hidden sm:block', isActive ? 'text-gold' : 'text-muted'].join(' ')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-white/10 mx-3" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1 — Date ────────────────────────────────────────────────────────────

function Step1Date({ tour, guests, selectedSlot, onAdjustGuests, onSelect, onNext }: {
  tour: TourData; guests: number; selectedSlot: AvailableSlot | null
  onAdjustGuests: (d: number) => void; onSelect: (s: AvailableSlot) => void; onNext: () => void
}) {
  return (
    <div className="card p-5 sm:p-10">
      <h3 className="font-display text-3xl tracking-wide mb-2">Pick a Date</h3>
      <p className="text-sm text-muted mb-6">All rides depart at 10 AM.</p>

      <div className="mb-8">
        <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-3">Number of Guests</label>
        <div className="flex items-center gap-4">
          <button onClick={() => onAdjustGuests(-1)} aria-label="Remove guest"
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-lg hover:border-gold hover:text-gold transition-colors">−</button>
          <span className="text-3xl font-light min-w-[40px] text-center tabular-nums">{guests}</span>
          <button onClick={() => onAdjustGuests(1)} aria-label="Add guest"
            className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-lg hover:border-gold hover:text-gold transition-colors">+</button>
          <span className="text-sm text-muted">{guests === 1 ? 'guest' : 'guests'}</span>
          <span className="text-sm text-gold ml-2">{formatPrice(tour.pricePerPerson * guests)} total</span>
        </div>
      </div>

      <AvailabilityCalendar tourSlug={tour.slug} selectedSlot={selectedSlot} onSelectSlot={onSelect} />

      <div className="mt-8">
        <button onClick={onNext} disabled={!selectedSlot}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          Next: Your Info →
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Guest Info ──────────────────────────────────────────────────────

function emptyGuest(): GuestDetail {
  return { firstName: '', lastName: '', email: '', heightFeet: 5, heightInches: 6 }
}

function GuestForm({ index, guest, onChange }: {
  index: number; guest: GuestDetail; onChange: (g: GuestDetail) => void
}) {
  const set = <K extends keyof GuestDetail>(key: K, value: GuestDetail[K]) =>
    onChange({ ...guest, [key]: value })

  return (
    <div className="border border-white/10 rounded-lg p-5 space-y-4">
      <div className="text-[11px] tracking-[3px] uppercase text-gold">
        {index === 0 ? 'Guest 1 (Primary)' : `Guest ${index + 1}`}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">First Name</label>
          <input className="field" type="text" placeholder="Jamie"
            value={guest.firstName} onChange={e => set('firstName', e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Last Name</label>
          <input className="field" type="text" placeholder="Smith"
            value={guest.lastName} onChange={e => set('lastName', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Email</label>
        <input className="field" type="email" placeholder="jamie@email.com"
          value={guest.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div>
        <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
          Height <span className="normal-case text-muted/60">(for bike fitting)</span>
        </label>
        <div className="flex items-center gap-3">
          <select className="field w-24"
            value={guest.heightFeet}
            onChange={e => set('heightFeet', Number(e.target.value))}>
            {[4, 5, 6, 7].map(f => <option key={f} value={f}>{f} ft</option>)}
          </select>
          <select className="field w-24"
            value={guest.heightInches}
            onChange={e => set('heightInches', Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i).map(i => <option key={i} value={i}>{i} in</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

function Step2GuestInfo({ guests, guestDetails, primaryPhone, specialRequests, loading,
  onChangeGuest, onChangePhone, onChangeRequests, onBack, onNext }: {
  guests: number; guestDetails: GuestDetail[]; primaryPhone: string; specialRequests: string
  loading: boolean
  onChangeGuest: (i: number, g: GuestDetail) => void
  onChangePhone: (v: string) => void
  onChangeRequests: (v: string) => void
  onBack: () => void; onNext: () => void
}) {
  const allValid = guestDetails.every(g =>
    g.firstName.trim() && g.lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email)
  ) && primaryPhone.trim().length >= 7

  return (
    <div className="card p-5 sm:p-10">
      <h3 className="font-display text-3xl tracking-wide mb-2">Your Details</h3>
      <p className="text-sm text-muted mb-6">We need info for each guest to fit bikes correctly.</p>

      <div className="space-y-4">
        {guestDetails.map((g, i) => (
          <GuestForm key={i} index={i} guest={g} onChange={(upd) => onChangeGuest(i, upd)} />
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
            Phone <span className="normal-case text-muted/60">(primary contact)</span>
          </label>
          <input className="field" type="tel" autoComplete="tel" placeholder="(617) 555-0100"
            value={primaryPhone} onChange={e => onChangePhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
            Special Requests <span className="normal-case text-muted/60">(optional)</span>
          </label>
          <textarea className="field" rows={3}
            placeholder="Celebrating a birthday? Accessibility needs? Let us know…"
            value={specialRequests} onChange={e => onChangeRequests(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="btn-outline flex-1">← Back</button>
        <button onClick={onNext} disabled={!allValid || loading}
          className="btn-primary flex-[2] disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
              Creating booking…
            </span>
          ) : 'Next: Payment →'}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3 — Payment ─────────────────────────────────────────────────────────

function PaymentForm({ totalCents, subtotalCents, guests, tourName, bookingReference,
  promoValidation, promoCode, onPromoCodeChange, onApplyPromo, onBack, onSuccess }: {
  totalCents: number; subtotalCents: number; guests: number; tourName: string
  bookingReference: string; promoValidation: PromoValidation | null
  promoCode: string; onPromoCodeChange: (c: string) => void
  onApplyPromo: () => Promise<void>; onBack: () => void; onSuccess: () => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading]           = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  async function handleSubmit() {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book/confirmation/${bookingReference}`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') onSuccess()
    else setLoading(false)
  }

  async function handleApplyPromo() {
    setPromoLoading(true)
    await onApplyPromo()
    setPromoLoading(false)
  }

  const discountCents = promoValidation?.discountCents ?? 0

  return (
    <div className="card p-5 sm:p-10">
      <h3 className="font-display text-3xl tracking-wide mb-6">Payment</h3>

      <div className="bg-gold/5 border border-gold/20 rounded-lg p-6 mb-6">
        <div className="text-[11px] tracking-[2px] uppercase text-gold mb-4">Order Summary</div>
        <div className="text-sm space-y-0">
          <div className="flex justify-between border-b border-white/[0.06] py-2.5">
            <span className="text-muted">{tourName} × {guests} {guests === 1 ? 'guest' : 'guests'}</span>
            <span>{formatPrice(subtotalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between border-b border-white/[0.06] py-2.5 text-green-400">
              <span>Promo <span className="font-mono text-xs bg-green-400/10 px-1.5 py-0.5 rounded">{promoCode}</span></span>
              <span>−{formatPrice(discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 text-gold font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(totalCents, true)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <input
            className="field flex-1 py-2.5 text-sm"
            placeholder="Promo or gift code"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
          />
          <button onClick={handleApplyPromo} disabled={promoLoading || !promoCode}
            className="btn-ghost whitespace-nowrap disabled:opacity-40">
            {promoLoading ? '…' : 'Apply'}
          </button>
        </div>
        {promoValidation && !promoValidation.valid && (
          <p className="text-red-400 text-xs mt-2">{promoValidation.error}</p>
        )}
        {promoValidation?.valid && (
          <p className="text-green-400 text-xs mt-2">
            ✓ {promoCode} applied —{' '}
            {promoValidation.type === 'PERCENTAGE' ? `${promoValidation.value}% off` : `${formatPrice(discountCents)} off`}
          </p>
        )}
      </div>

      <div className="mb-6">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-4 text-xs text-white/50 mb-6 leading-relaxed">
        🔒 Payments processed securely via Stripe. Free cancellation up to 48 hours before your ride.
        Refunds issued within 5 business days.
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className="btn-outline flex-1">← Back</button>
        <button onClick={handleSubmit} disabled={loading || !stripe || !elements}
          className="btn-primary flex-[2] disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
              Processing…
            </span>
          ) : `Pay ${formatPrice(totalCents, true)} ✦`}
        </button>
      </div>
    </div>
  )
}

// ─── Redirect after confirmation ──────────────────────────────────────────────

function ConfirmationRedirect({ reference }: { reference: string }) {
  const router = useRouter()
  useEffect(() => { router.push(`/book/confirmation/${reference}`) }, [reference, router])
  return (
    <div className="card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-400 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
      <p className="text-muted text-sm animate-pulse tracking-widests uppercase">Booking confirmed — redirecting…</p>
    </div>
  )
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export function BookingFlow({ tours: rawTours }: { tours: TourData[] }) {
  const searchParams = useSearchParams()
  const tour = rawTours[0]  // single active tour

  const initialGuests = Math.max(1, Number(searchParams.get('guests') ?? 2))

  const [step, setStep]                   = useState(1)
  const [guests, setGuests]               = useState(initialGuests)
  const [selectedSlot, setSelectedSlot]   = useState<AvailableSlot | null>(null)
  const [guestDetails, setGuestDetails]   = useState<GuestDetail[]>(
    Array.from({ length: initialGuests }, emptyGuest)
  )
  const [primaryPhone, setPrimaryPhone]   = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [clientSecret, setClientSecret]   = useState<string | null>(null)
  const [bookingRef, setBookingRef]       = useState<string | null>(null)
  const [totalCents, setTotalCents]       = useState(0)
  const [subtotalCents, setSubtotalCents] = useState(0)
  const [promoCode, setPromoCode]         = useState('')
  const [promoValidation, setPromoValidation] = useState<PromoValidation | null>(null)
  const [globalError, setGlobalError]     = useState<string | null>(null)
  const [creatingBooking, setCreatingBooking] = useState(false)
  const [confirmed, setConfirmed]         = useState(false)

  function handleAdjustGuests(delta: number) {
    const next = Math.max(1, Math.min(20, guests + delta))
    setGuests(next)
    setGuestDetails(prev => {
      if (next > prev.length) {
        return [...prev, ...Array.from({ length: next - prev.length }, emptyGuest)]
      }
      return prev.slice(0, next)
    })
  }

  function handleChangeGuest(i: number, g: GuestDetail) {
    setGuestDetails(prev => prev.map((old, idx) => idx === i ? g : old))
  }

  async function handleCreateBooking() {
    if (!selectedSlot || !tour) return
    setCreatingBooking(true)
    setGlobalError(null)
    try {
      const primary = guestDetails[0]
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          guestCount: guests,
          firstName: primary.firstName,
          lastName: primary.lastName,
          email: primary.email,
          phone: primaryPhone,
          specialRequests: specialRequests || undefined,
          promoCode: promoCode || undefined,
          guestsData: guestDetails,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create booking. Please try again.')
      }
      const data: { clientSecret: string; reference: string; totalCents: number } = await res.json()
      setClientSecret(data.clientSecret)
      setBookingRef(data.reference)
      setTotalCents(data.totalCents)
      setSubtotalCents(tour.pricePerPerson * guests)
      setStep(3)
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setCreatingBooking(false)
    }
  }

  async function handleApplyPromo() {
    if (!promoCode || !tour) return
    const subtotal = tour.pricePerPerson * guests
    try {
      const res = await fetch('/api/bookings/validate-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotalCents: subtotal }),
      })
      const data: PromoValidation = await res.json()
      setPromoValidation(data)
      if (data.valid && data.discountCents) setTotalCents(subtotal - data.discountCents)
    } catch {
      setPromoValidation({ valid: false, error: 'Could not validate code.' })
    }
  }

  if (!tour) {
    return (
      <div className="card p-10 text-center text-muted text-sm">
        No tours currently available. Check back soon!
      </div>
    )
  }

  if (confirmed && bookingRef) return <ConfirmationRedirect reference={bookingRef} />

  return (
    <div>
      <StepIndicator current={step} />

      {globalError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-5 py-3 mb-6 flex items-start gap-3">
          <span className="shrink-0 mt-0.5">⚠</span>
          {globalError}
        </div>
      )}

      {step === 1 && (
        <Step1Date
          tour={tour} guests={guests} selectedSlot={selectedSlot}
          onAdjustGuests={handleAdjustGuests}
          onSelect={setSelectedSlot}
          onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <Step2GuestInfo
          guests={guests} guestDetails={guestDetails}
          primaryPhone={primaryPhone} specialRequests={specialRequests}
          loading={creatingBooking}
          onChangeGuest={handleChangeGuest}
          onChangePhone={setPrimaryPhone}
          onChangeRequests={setSpecialRequests}
          onBack={() => setStep(1)} onNext={handleCreateBooking} />
      )}

      {step === 3 && clientSecret && bookingRef && (
        <Elements stripe={stripePromise} options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#F5C842', colorBackground: '#16173D',
              colorText: '#ffffff', colorDanger: '#FF6464',
              fontFamily: 'DM Sans, sans-serif', borderRadius: '6px',
            },
          },
        }}>
          <PaymentForm
            totalCents={totalCents} subtotalCents={subtotalCents}
            guests={guests} tourName={tour.name} bookingReference={bookingRef}
            promoValidation={promoValidation} promoCode={promoCode}
            onPromoCodeChange={(c) => { setPromoCode(c); setPromoValidation(null) }}
            onApplyPromo={handleApplyPromo}
            onBack={() => setStep(2)}
            onSuccess={() => setConfirmed(true)} />
        </Elements>
      )}
    </div>
  )
}
