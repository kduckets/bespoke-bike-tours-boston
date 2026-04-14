// src/app/page.tsx
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { HeroParticles } from '@/components/ui/HeroParticles'
import { InlineBookingWidgetClient as InlineBookingWidget } from '@/components/booking/InlineBookingWidgetClient'

const SERVICES = [
  {
    badge: '★ Most Popular',
    title: 'THE MAIN EVENT',
    desc: '2.5-hour guided group ride hitting Boston\'s greatest hits — the Esplanade, Back Bay, Beacon Hill & beyond.',
    price: '$75',
    unit: '/ person',
    featured: true,
  },
  {
    badge: 'Learn',
    title: 'BIKE LESSONS',
    desc: 'Never rode, or need a refresh? Private and semi-private sessions to get you rolling with confidence.',
    price: '$55',
    unit: '/ session',
  },
  {
    badge: 'Exclusive',
    title: 'PRIVATE GROUP',
    desc: 'Bachelorettes, birthdays, corporate outings — your crew, your route, your vibe. Fully customizable.',
    price: '$450',
    unit: '+ group base',
  },
]

const TESTIMONIALS = [
  {
    text: 'This was the absolute highlight of our Boston trip. Our guide knew every hidden alley and had the playlist to match. We\'ve already booked again for our anniversary.',
    author: 'Sarah M. — New York, NY',
  },
  {
    text: 'Did the bachelorette package and WOW. They set up champagne stops, had playlist requests, and the route was stunning. Everyone is still talking about it.',
    author: 'Jess R. — Chicago, IL',
  },
  {
    text: 'I hadn\'t ridden a bike in 20 years. The lesson was patient, fun, and completely non-judgmental. By the end I was ready to join the main tour.',
    author: 'Tom K. — Boston, MA',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center
                          overflow-hidden bg-navy -mt-[70px]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(74,45,176,0.5)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(61,45,181,0.3)_0%,transparent_50%)]" />
        </div>

        <HeroParticles />

        <div className="relative z-10 text-center max-w-3xl px-6 pt-[70px]">
          <div className="inline-block border border-gold/40 bg-gold/10 text-gold
                          text-[11px] tracking-[3px] uppercase px-5 py-2 rounded-sm mb-6">
            ✦ Est. 2025 · Boston, MA ✦
          </div>

          <h1 className="font-display leading-[0.9] tracking-wide mb-3">
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] text-white">RIDE</span>
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] shimmer-gold">BOSTON</span>
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] text-white">IN STYLE</span>
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-iris-2 mb-10">
            Guided rides. Iconic sights. Unforgettable night out.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/book" className="btn-primary">Book Your Ride ✦</Link>
            <Link href="/tours" className="btn-outline">See All Tours</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                        items-center gap-2 text-white/40 text-[11px] tracking-[2px] uppercase">
          <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
               style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Services strip ────────────────────────────────────────────────── */}
      <section className="bg-navy-2 border-t border-gold/20 border-b border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Link
              key={s.title}
              href="/book"
              className={`group relative px-10 py-12 border-r border-white/[0.06] last:border-r-0
                          transition-colors hover:bg-purple-2/15 overflow-hidden
                          ${s.featured ? 'bg-purple-2/20' : ''}`}
            >
              {/* Animated gold top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-2 via-gold-3 to-gold
                              scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300
                              [.featured_&]:scale-x-100" />
              {s.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-2 via-gold-3 to-gold" />
              )}

              <div className="text-[10px] tracking-[3px] uppercase text-gold mb-3">{s.badge}</div>
              <div className="font-display text-4xl tracking-wide mb-3">{s.title}</div>
              <p className="text-sm text-muted leading-relaxed mb-5">{s.desc}</p>
              <div className="text-3xl font-light">
                {s.price}
                <small className="text-sm text-muted ml-1">{s.unit}</small>
              </div>

              <span className="absolute bottom-10 right-10 text-gold opacity-0
                               group-hover:opacity-100 group-hover:translate-x-1
                               transition-all duration-200 text-xl">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Inline booking widget ─────────────────────────────────────────── */}
      <section className="py-20 px-10 max-w-4xl mx-auto">
        <div className="section-label">Reserve Your Spot</div>
        <h2 className="section-title mb-10">BOOK A TOUR</h2>
        <InlineBookingWidget />
      </section>

      <div className="gold-divider mx-10" />

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="bg-navy-2 py-20 px-10 text-center">
        <div className="section-label">Reviews</div>
        <h2 className="section-title mb-2">WHAT RIDERS SAY</h2>
        <p className="text-sm text-muted mb-12">★★★★★ 4.9 average across 200+ reviews</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="card p-8 text-left">
              <div className="text-gold text-sm mb-4">★★★★★</div>
              <p className="text-sm text-white/80 leading-relaxed italic mb-5">"{t.text}"</p>
              <div className="text-[11px] font-semibold tracking-widest uppercase text-iris-2">
                {t.author}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
