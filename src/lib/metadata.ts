// src/lib/metadata.ts
import type { Metadata } from 'next'

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.bespokebiketoursboston.com'

// Replace with a proper 1200x630 landscape image when available.
// Until then the square logo is used as a fallback for all OG surfaces.
const OG_IMAGE = {
  url: `${BASE_URL}/logo.jpg`,
  width: 800,
  height: 800,
  alt: 'Bespoke Bike Tours Boston — Guided rides through iconic Boston sights',
}

export function buildMetadata(opts: {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${BASE_URL}${opts.path ?? ''}`
  const fullTitle = `${opts.title} | Bespoke Bike Tours Boston`

  return {
    title: fullTitle,
    description: opts.description,
    ...(opts.noIndex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: 'Bespoke Bike Tours Boston',
      type: 'website',
      locale: 'en_US',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [OG_IMAGE.url],
    },
    alternates: { canonical: url },
  }
}
