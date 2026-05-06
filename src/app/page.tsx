// src/app/page.tsx
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { HeroParticles } from '@/components/ui/HeroParticles'
import { InlineBookingWidgetClient as InlineBookingWidget } from '@/components/booking/InlineBookingWidgetClient'
import { getSiteContent } from '@/lib/site-content'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

const FALLBACK_TESTIMONIALS = [
  {
    id: 'f1',
    quote: 'This was the absolute highlight of our Boston trip. Our guide knew every hidden alley and had the playlist to match. We\'ve already booked again for our anniversary.',
    author: 'Sarah M.',
    location: 'New York, NY',
    rating: 5,
  },
  {
    id: 'f2',
    quote: 'Did the bachelorette package and WOW. They set up champagne stops, had playlist requests, and the route was stunning. Everyone is still talking about it.',
    author: 'Jess R.',
    location: 'Chicago, IL',
    rating: 5,
  },
  {
    id: 'f3',
    quote: 'I hadn\'t ridden a bike in 20 years. The lesson was patient, fun, and completely non-judgmental. By the end I was ready to join the main tour.',
    author: 'Tom K.',
    location: 'Boston, MA',
    rating: 5,
  },
]

export default async function HomePage() {
  const [hero, dbTestimonials] = await Promise.all([
    getSiteContent(['hero_tagline', 'hero_line1', 'hero_line2', 'hero_line3', 'hero_subheadline', 'hero_image_url']),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : FALLBACK_TESTIMONIALS

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center
                          overflow-hidden bg-navy -mt-[70px]">
        {/* Hero background image (if set) */}
        {hero.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            aria-hidden="true"
          />
        )}

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(74,45,176,0.5)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(61,45,181,0.3)_0%,transparent_50%)]" />
        </div>

        {!hero.hero_image_url && <HeroParticles />}

        <div className="relative z-10 text-center max-w-3xl px-6 pt-[70px]">
          <div className="inline-block border border-gold/40 bg-gold/10 text-gold
                          text-[11px] tracking-[3px] uppercase px-5 py-2 rounded-sm mb-6">
            {hero.hero_tagline}
          </div>

          <h1 className="font-display leading-[0.9] tracking-wide mb-3">
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] text-white">{hero.hero_line1}</span>
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] shimmer-gold">{hero.hero_line2}</span>
            <span className="block text-[56px] sm:text-[76px] md:text-[96px] text-white">{hero.hero_line3}</span>
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-iris-2 mb-10">
            {hero.hero_subheadline}
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
          {testimonials.map((t) => (
            <div key={t.id} className="card p-8 text-left">
              <div className="text-gold text-sm mb-4">{'★'.repeat(t.rating)}</div>
              <p className="text-sm text-white/80 leading-relaxed italic mb-5">"{t.quote}"</p>
              <div className="text-[11px] font-semibold tracking-widest uppercase text-iris-2">
                {t.author} — {t.location}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
