// src/app/tours/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Our Tours',
  description: 'Choose your Boston adventure — The Main Event group ride, Sunset Ride, Bike Lessons, or a fully custom Private Group experience.',
  path: '/tours',
})

const TOURS = [
  {
    badge: '★ Most Popular',
    label: 'BESTSELLER',
    title: 'THE MAIN EVENT',
    desc: 'The classic Boston experience on two wheels. Hit every iconic landmark while your guide keeps the energy high and the stories flowing.',
    details: [
      ['Duration', '2.5 Hours'],
      ['Group Size', 'Up to 12 riders'],
      ['Skill Level', 'Any'],
      ['Start Location', 'The Esplanade'],
      ['Available', 'Daily (weather permitting)'],
    ],
    includes: ['Bike & helmet rental', 'Expert local guide', 'Route map & water', 'Curated playlist'],
    price: 75,
    unit: 'per person',
    slug: 'main-event',
  },
  {
    badge: 'Evening',
    title: 'THE SUNSET RIDE',
    desc: 'Chase the golden hour through Boston\'s most scenic waterfront corridors. Ends with a toast at a secret spot overlooking the Charles.',
    details: [
      ['Duration', '2 Hours'],
      ['Group Size', 'Up to 10 riders'],
      ['Skill Level', 'Any'],
      ['Start', '90 min before sunset'],
      ['Available', 'Fri–Sun, seasonal'],
    ],
    includes: ['Bike & helmet rental', 'Expert local guide', 'Sparkling toast at finale', 'Photo opportunity stops'],
    price: 85,
    unit: 'per person',
    slug: 'sunset-ride',
  },
  {
    badge: 'Learn',
    title: 'BIKE LESSONS',
    desc: 'Patient, fun, zero judgment. Whether you\'ve never ridden or just need to shake off the rust — we\'ll have you rolling with confidence.',
    details: [
      ['Duration', '1 Hour'],
      ['Format', 'Private or Semi-Private'],
      ['Skill Level', 'Beginner'],
      ['Location', 'The Esplanade (flat!)'],
      ['Available', 'Daily by appointment'],
    ],
    includes: ['Bike & helmet provided', '1-on-1 certified instructor', 'Balance & braking fundamentals', '20% discount on next tour'],
    price: 55,
    unit: 'per session',
    slug: 'bike-lessons',
  },
  {
    badge: 'Exclusive',
    title: 'PRIVATE GROUP',
    desc: 'Bachelorettes, birthdays, corporate team building. Your crew, your route, your music. We handle everything — you just show up and party.',
    details: [
      ['Duration', '2–4 Hours (flexible)'],
      ['Group Size', '6–20 riders'],
      ['Skill Level', 'Any'],
      ['Route', 'Fully Customizable'],
      ['Available', 'By request'],
    ],
    includes: ['All bikes & helmets', 'Dedicated guide(s)', 'Custom playlist & itinerary', 'Optional bar stops & extras'],
    price: 450,
    unit: 'group base + $45/person',
    slug: 'private-group',
  },
]

export default function ToursPage() {
  return (
    <>
      <div className="pt-[70px]">
        {/* Hero */}
        <div className="bg-navy-2 border-b border-white/[0.06] py-16 px-10 text-center">
          <div className="section-label">What We Offer</div>
          <h1 className="font-display text-7xl tracking-widest">OUR TOURS</h1>
          <p className="text-muted mt-2 text-base">Every ride is a story. Pick yours.</p>
        </div>

        {/* Tour cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-10 py-12">
          {TOURS.map((tour) => (
            <div key={tour.slug} className="card flex flex-col">
              {/* Header */}
              <div className="p-8 border-b border-white/[0.06] relative">
                <div className="text-[10px] tracking-[3px] uppercase text-gold mb-2">{tour.badge}</div>
                <h2 className="font-display text-4xl tracking-wide mb-2">{tour.title}</h2>
                <p className="text-sm text-muted leading-relaxed">{tour.desc}</p>
                {tour.label && (
                  <div className="absolute top-8 right-8 bg-gold/10 border border-gold/30
                                  text-gold text-[10px] tracking-widest uppercase
                                  px-3 py-1.5 rounded-sm">
                    {tour.label}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="px-8 py-6 border-b border-white/[0.06]">
                {tour.details.map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5 text-sm
                                              border-b border-white/[0.05] last:border-0">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div className="px-8 py-6 border-b border-white/[0.06]">
                <div className="text-[11px] tracking-[2px] uppercase text-muted mb-3">Included</div>
                {tour.includes.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-1.5 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 flex items-center justify-between mt-auto">
                <div>
                  <div className="font-display text-5xl text-gold leading-none">${tour.price}</div>
                  <div className="text-xs text-muted mt-1">{tour.unit}</div>
                </div>
                <Link href={`/book?tour=${tour.slug}`} className="btn-primary">
                  Book Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
