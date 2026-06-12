// src/app/robots.ts
import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default: all crawlers can index public pages
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/book/confirmation/'],
      },
      {
        // Explicitly allow AI search crawlers to index public content
        // so we appear in Perplexity, ChatGPT search, Claude, etc.
        userAgent: [
          'GPTBot',          // OpenAI
          'ChatGPT-User',    // OpenAI
          'ClaudeBot',       // Anthropic
          'anthropic-ai',    // Anthropic
          'PerplexityBot',   // Perplexity
          'Googlebot-Extended', // Google AI
          'CCBot',           // Common Crawl (used by many AI labs)
          'Amazonbot',       // Amazon
          'meta-externalagent', // Meta
        ],
        allow: '/',
        disallow: ['/admin/', '/api/', '/book/confirmation/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
