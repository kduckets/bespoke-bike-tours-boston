'use client'
// src/components/layout/Navbar.tsx
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/tours',   label: 'Tours' },
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null // Admin has its own sidebar nav

  return (
    <header className="fixed top-0 w-full z-50 px-10 py-4 flex items-center justify-between
                       bg-navy/90 backdrop-blur-md border-b border-gold/15">
      {/* Logo */}
      <Link href="/" className="group">
        <Image
          src="/logo.jpg"
          alt="Bespoke Bike Tours Boston"
          width={52}
          height={52}
          className="rounded-full transition-opacity group-hover:opacity-80"
          priority
        />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'text-[13px] font-medium tracking-widest uppercase transition-colors',
              pathname === href ? 'text-gold' : 'text-white/70 hover:text-gold'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <Link href="/book" className="btn-primary text-[11px] px-6 py-3">
        Book Now ✦
      </Link>
    </header>
  )
}
