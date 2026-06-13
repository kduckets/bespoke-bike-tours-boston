import { prisma } from './prisma'

export const SITE_CONTENT_DEFAULTS: Record<string, string> = {
  hero_tagline:     'Est. 2025 · Boston, MA',
  hero_line1:       'BESPOKE',
  hero_line2:       'BOSTON',
  hero_line3:       'BIKE TOURS',
  hero_subheadline: "Boston's Best Bites By Bike",
  hero_image_url:   '',
  contact_email:    'bespokebiketoursboston@gmail.com',
  contact_phone:    '',
  contact_location: 'Boston',
  contact_hours:    'Daily 9 AM – 5 PM',
  contact_instagram_handle: '@bespokebiketoursbos',
  contact_instagram_url:    'https://instagram.com/bespokebiketoursbos',
  footer_tagline:   "Boston's Best Bites by Bike",
  footer_tiktok_url: '',
  about_quote: "We aren't just tour guides; we're locals helping you get a true taste of the city.",
  about_body: `Most tours keep you at a distance. We bring you right into the life of the city! At Bespoke Bike Tours Boston, we turn a day in Boston into an active, immersive food tour experience, so you don't just see the city, you feel it, riding alongside people while enjoying the best bites around town.

About Bespoke Bike Tours Boston
We believe the best way to experience a new place is on two wheels with a focus on flavor. Walking tours move too slowly, buses keep you removed, but a bike puts you right in it. You cover real ground, follow your curiosity, and stop when something catches your eye, feeling how the neighborhoods connect as they unfold around you - all while enjoying the best bites Boston has to offer!

Our tours are not about long history lectures, though you will pick up a bit along the way. They are about getting a true feel—and taste—for the city. We take you off the worn tourist routes and into the neighborhoods that make Boston, Cambridge, and Somerville what they are: vibrant, delicious, and always evolving.

We build our rides to share the Boston we know and love. Not only the landmarks, but the cafés, the side streets, and the local culinary gems that make each square its own destination.

Ride With Us

Whether you join our signature Big Day Out tour or book a private ride tailored to your perfect day, we will make sure your time in Boston is one to remember.

Ready to ride? Get in touch through our contact form and let's plan your perfect day on two wheels.`,
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
