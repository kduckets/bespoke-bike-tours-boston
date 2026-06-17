// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/layout/Providers'
import { BASE_URL } from '@/lib/metadata'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  weight: ['700'],
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
})

const OG_IMAGE = {
  url: `${BASE_URL}/logo.jpg`,
  width: 800,
  height: 800,
  alt: 'Bespoke Bike Tours Boston — Guided rides through iconic Boston sights',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Bespoke Bike Tours Boston',
    template: '%s | Bespoke Bike Tours Boston',
  },
  description:
    'Boston\'s best guided bike tours. Ride the Esplanade, explore Back Bay, and see the city\'s most iconic sights — no khaki shirts, no boring lectures. Book online.',
  keywords: [
    'bike tours Boston',
    'guided bike rides Boston',
    'Boston cycling tour',
    'group bike tour Boston',
    'sunset bike ride Boston',
    'Esplanade bike tour',
    'Boston sightseeing bike',
    'bespoke bike tours',
    'private bike tour Boston',
    'things to do in Boston',
  ],
  authors: [{ name: 'Bespoke Bike Tours Boston', url: BASE_URL }],
  creator: 'Bespoke Bike Tours Boston',
  publisher: 'Bespoke Bike Tours Boston',
  category: 'travel',
  verification: {
    google: 'kDrgUwuyHsazOBCGDbDiFf2dKh1oea81JgBebZBnvss',
  },
  icons: {
    icon: [
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Bespoke Bike Tours Boston',
    description:
      'Boston\'s best guided bike tours. Ride the Esplanade, explore iconic sights — no boring lectures. Book online.',
    url: BASE_URL,
    siteName: 'Bespoke Bike Tours Boston',
    type: 'website',
    locale: 'en_US',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bespoke Bike Tours Boston',
    description: 'Boston\'s best guided bike tours. Ride iconic sights — no boring lectures. Book online.',
    images: [`${BASE_URL}/logo.jpg`],
    // Add your Twitter/X handle here when you have one: site: '@yourhandle'
  },
  alternates: { canonical: BASE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Add your Google Search Console verification token here when you have it:
  // verification: { google: 'your-token-here' },
}

// JSON-LD structured data for Google rich results and AI assistants
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'TouristInformationCenter'],
  name: 'Bespoke Bike Tours Boston',
  description:
    "Boston's best guided bike tours. We ride the Esplanade, explore Back Bay, and showcase the city's most iconic sights. No khaki shirts, no boring lectures — just great routes and unforgettable experiences.",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.jpg`,
  image: `${BASE_URL}/logo.jpg`,
  telephone: '+16175550190',
  email: 'bespokebiketoursboston@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '100 Embankment Rd (The Esplanade, Hatch Shell)',
    addressLocality: 'Boston',
    addressRegion: 'MA',
    postalCode: '02114',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 42.3554,
    longitude: -71.0707,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00',
    closes: '19:00',
  },
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card',
  areaServed: {
    '@type': 'City',
    name: 'Boston',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Bike Tour Experiences',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TouristTrip',
          name: 'The Main Event',
          description: 'A fully customized guided bike tour of Boston — tailored route, stops, and pace.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TouristTrip',
          name: 'The Sunset Ride',
          description: 'Chase golden hour through Boston\'s scenic waterfront corridors.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TouristTrip',
          name: 'Private Group Tour',
          description: 'Fully customized private bike tour for groups of 6–20. Perfect for bachelorettes, birthdays, and corporate events.',
        },
      },
    ],
  },
  sameAs: [
    'https://instagram.com/bespokebikeboston',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${bebasNeue.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
