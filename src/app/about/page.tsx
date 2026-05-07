// src/app/about/page.tsx
import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { buildMetadata } from '@/lib/metadata'
import { prisma } from '@/lib/prisma'
import { getSiteContent } from '@/lib/site-content'

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Meet the Boston local behind the best bike tour in the city. No khaki shirts, no monotone history lectures. Just great routes and unforgettable experiences.',
  path: '/about',
})

const COLOR_CLASS: Record<string, string> = {
  gold:   'bg-gold/15 text-gold',
  iris:   'bg-iris/20 text-iris-2',
  purple: 'bg-purple-2/30 text-iris-2',
}

export default async function AboutPage() {
  const [heroContent, members, values] = await Promise.all([
    getSiteContent(['about_quote', 'about_body']),
    prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.aboutValue.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
  ])

  const guide = members[0] ?? null

  return (
    <>
      <div className="pt-[70px]">
        {/* Hero */}
        <div className="bg-navy-2 border-b border-gold/15 py-20 px-10 text-center">
          <div className="section-label">Our Story</div>
          <h1 className="font-display text-7xl tracking-widests mb-8">ABOUT US</h1>
          <blockquote className="font-serif italic text-4xl leading-snug text-white
                                  max-w-2xl mx-auto mb-8">
            &ldquo;{heroContent.about_quote.replace(/^["""]|["""]$/g, '')}&rdquo;
          </blockquote>
          <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
            {heroContent.about_body}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-10 py-20">
          {/* Guide */}
          {guide && (
            <div className="mb-20">
              <div className="section-label">Your Guide</div>
              <h2 className="font-display text-5xl tracking-wide mb-10">MEET ALEX</h2>

              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Photo or avatar */}
                <div className="shrink-0">
                  {guide.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={guide.photoUrl}
                      alt={guide.name}
                      className="w-64 h-64 object-cover rounded-2xl border border-gold/20"
                    />
                  ) : (
                    <div className={`w-40 h-40 rounded-2xl flex items-center justify-center
                                     font-display text-5xl tracking-widests
                                     ${COLOR_CLASS[guide.color] ?? COLOR_CLASS.purple}`}>
                      {guide.initials}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="flex-1">
                  <div className="font-bold text-2xl mb-1">{guide.name}</div>
                  <div className="text-[11px] tracking-[3px] uppercase text-gold mb-6">{guide.role}</div>
                  <p className="text-muted leading-relaxed text-base">{guide.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Values */}
          {values.length > 0 && (
            <>
              <div className="section-label">Our Values</div>
              <h2 className="font-display text-5xl tracking-wide mb-12">WHAT WE STAND FOR</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {values.map((v, i) => (
                  <div key={v.id} className="pl-8 pr-6 py-8 border-l-[3px] border-gold mb-6">
                    <div className="font-display text-6xl text-gold/20 mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-lg font-bold mb-2">{v.title}</div>
                    <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
