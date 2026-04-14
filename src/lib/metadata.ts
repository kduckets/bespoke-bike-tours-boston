// src/lib/metadata.ts
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bespokebikeboston.com'

export function buildMetadata(opts: {
  title: string
  description: string
  path?: string
}): Metadata {
  const url = `${BASE}${opts.path ?? ''}`
  return {
    title:       `${opts.title} | Bespoke Bike Tours Boston`,
    description: opts.description,
    openGraph: {
      title:       opts.title,
      description: opts.description,
      url,
      siteName:    'Bespoke Bike Tours Boston',
      type:        'website',
    },
    twitter: {
      card:        'summary_large_image',
      title:       opts.title,
      description: opts.description,
    },
    alternates: { canonical: url },
  }
}
