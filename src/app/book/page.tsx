// src/app/book/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Book a Tour',
  description: 'Reserve your spot on a Bespoke Bike Tours Boston experience. Choose your tour, date, and time — secure payment via Stripe.',
  path: '/book',
})

export default function BookPage() {
  return (
    <div className="pt-[70px] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="section-label">Secure Your Spot</div>
          <h1 className="font-display text-6xl tracking-wide">BOOK YOUR RIDE</h1>
        </div>
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-muted text-sm tracking-widest uppercase animate-pulse">
              Loading…
            </div>
          </div>
        }>
          <BookingFlow />
        </Suspense>
      </div>
    </div>
  )
}
