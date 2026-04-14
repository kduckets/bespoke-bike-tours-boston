// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/layout/Providers'

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

export const metadata: Metadata = {
  title: 'Bespoke Bike Tours Boston',
  description: 'Guided rides. Iconic sights. Unforgettable Boston.',
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
  openGraph: {
    title: 'Bespoke Bike Tours Boston',
    description: 'Guided rides. Iconic sights. Unforgettable Boston.',
    type: 'website',
    images: [{ url: '/logo.jpg', width: 800, height: 800 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${bebasNeue.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
