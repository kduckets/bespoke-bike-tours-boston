// src/app/sitemap.ts
import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bespokebikeboston.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/tours`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/book`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/about`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
