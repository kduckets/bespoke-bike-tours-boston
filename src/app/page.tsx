// src/app/page.tsx
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { HeroParticles } from '@/components/ui/HeroParticles'
import { InlineBookingWidgetClient as InlineBookingWidget } from '@/components/booking/InlineBookingWidgetClient'
import { getSiteContent } from '@/lib/site-content'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const [hero, testimonials, tour, faqs] = await Promise.all([
    getSiteContent(['hero_tagline', 'hero_line1', 'hero_line2', 'hero_line3', 'hero_subheadline', 'hero_image_url']),
    prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.tour.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }).catch(() => null),
    (async () => { try { return await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }) } catch { return [] } })(),
  ])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center
                          overflow-hidden bg-navy -mt-[70px]">
        {hero.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            aria-hidden="true"
          />
        )}

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

          <Link href="/book" className="btn-primary">Book Your Ride ✦</Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
                        items-center gap-2 text-white/40 text-[11px] tracking-[2px] uppercase">
          <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
               style={{ animation: 'scroll-pulse 2s ease-in-out infinite' }} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Tour Description Tile ─────────────────────────────────────────── */}
      {tour && (
        <section className="bg-navy-2 border-y border-gold/15">
          <div className="max-w-5xl mx-auto px-10 py-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="section-label">The Experience</div>
              <h2 className="font-display text-4xl tracking-wide mb-4">{tour.name.toUpperCase()}</h2>
              <p className="text-muted leading-relaxed mb-6">{tour.description}</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gold">⏱</span>
                  <span className="text-white/70">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold">👥</span>
                  <span className="text-white/70">Up to {tour.maxCapacity} riders</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  <span className="text-white/70">{formatPrice(tour.pricePerPerson)} per person</span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <Link href="/book" className="btn-primary text-base px-8 py-4">
                Book Now ✦
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Inline booking widget ─────────────────────────────────────────── */}
      <section className="py-20 px-10 max-w-4xl mx-auto">
        <div className="section-label">Reserve Your Spot</div>
        <h2 className="section-title mb-10">BOOK A TOUR</h2>
        <InlineBookingWidget />
      </section>

      {testimonials.length > 0 && (
        <>
          <div className="gold-divider mx-10" />

          {/* ── Testimonials ────────────────────────────────────────────────── */}
          <section className="bg-navy-2 py-20 px-10 text-center">
            <div className="section-label">Reviews</div>
            <h2 className="section-title mb-2">WHAT RIDERS SAY</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t: { id: string; quote: string; author: string; location: string; rating: number }) => (
                <div key={t.id} className="card p-8 text-left">
                  <div className="text-gold text-sm mb-4">{'★'.repeat(t.rating)}</div>
                  <p className="text-sm text-white/80 leading-relaxed italic mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-iris-2">
                    {t.author} — {t.location}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="py-20 px-10 max-w-3xl mx-auto">
          <div className="section-label">FAQ</div>
          <h2 className="section-title mb-12">COMMON QUESTIONS</h2>
          <div className="space-y-0">
            {faqs.map((faq: { id: string; question: string; answer: string }, i: number) => (
              <div key={faq.id} className={`border-t border-white/[0.08] py-6 ${i === faqs.length - 1 ? 'border-b' : ''}`}>
                <div className="font-semibold text-base mb-2">{faq.question}</div>
                <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
