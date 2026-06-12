// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/tours`,      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/book`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/about`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
