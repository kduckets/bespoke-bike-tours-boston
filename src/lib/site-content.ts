import { prisma } from './prisma'

export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
  hero_tagline:     '✦ Est. 2025 · Boston, MA ✦',
  hero_line1:       'RIDE',
  hero_line2:       'BOSTON',
  hero_line3:       'IN STYLE',
  hero_subheadline: 'Guided rides. Iconic sights. Unforgettable night out.',
  hero_image_url:   '',
  contact_email:    'hello@bespokebikeboston.com',
  contact_phone:    '(617) 555-0190',
  contact_location: 'The Esplanade, Hatch Shell',
  contact_hours:    'Daily 9 AM – 7 PM',
  contact_instagram_handle: '@bespokebikeboston',
  contact_instagram_url:    'https://instagram.com/bespokebikeboston',
}

export async function getSiteContent(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteContent.findMany({ where: { key: { in: keys } } })
    const stored = Object.fromEntries(rows.map(r => [r.key, r.value]))
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = stored[key] ?? SITE_CONTENT_DEFAULTS[key] ?? ''
    }
    return result
  } catch {
    // Return defaults if DB is unreachable
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = SITE_CONTENT_DEFAULTS[key] ?? ''
    }
    return result
  }
}
