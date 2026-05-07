// src/app/admin/(protected)/site/page.tsx
import { prisma } from '@/lib/prisma'
import { getSiteContent, SITE_CONTENT_DEFAULTS } from '@/lib/site-content'
import { SiteHeroEditor } from '@/components/admin/SiteHeroEditor'
import { SiteTestimonialsEditor } from '@/components/admin/SiteTestimonialsEditor'
import { SiteContactEditor } from '@/components/admin/SiteContactEditor'
import { FaqEditor } from '@/components/admin/FaqEditor'

const HERO_KEYS = ['hero_tagline', 'hero_line1', 'hero_line2', 'hero_line3', 'hero_subheadline', 'hero_image_url']
const CONTACT_KEYS = ['contact_email', 'contact_phone', 'contact_location', 'contact_hours', 'contact_instagram_handle', 'contact_instagram_url']

export default async function SitePage() {
  const [heroContent, contactContent, testimonials, faqs] = await Promise.all([
    getSiteContent(HERO_KEYS),
    getSiteContent(CONTACT_KEYS),
    prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }).catch(() => []),
    (async () => { try { return await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } }) } catch { return [] } })(),
  ])

  const heroWithDefaults = { ...SITE_CONTENT_DEFAULTS, ...heroContent }
  const contactWithDefaults = { ...SITE_CONTENT_DEFAULTS, ...contactContent }

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <div className="text-[9px] tracking-[3px] uppercase text-gold mb-1">Admin</div>
        <h1 className="font-display text-5xl tracking-widests">SITE</h1>
        <p className="text-muted text-sm mt-1">Manage homepage content, testimonials, FAQs, and contact details.</p>
      </div>

      <SiteHeroEditor initial={heroWithDefaults} />
      <SiteTestimonialsEditor initial={testimonials} />
      <FaqEditor initial={faqs} />
      <SiteContactEditor initial={contactWithDefaults} />
    </div>
  )
}
