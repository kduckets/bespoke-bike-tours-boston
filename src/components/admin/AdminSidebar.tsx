'use client'
// src/components/admin/AdminSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',              icon: '◉', label: 'Overview',     exact: true },
  { href: '/admin/bookings',     icon: '📋', label: 'Bookings' },
  { href: '/admin/availability', icon: '📅', label: 'Availability' },
  { href: '/admin/discounts',    icon: '🏷', label: 'Discounts & Refunds' },
  { href: '/admin/site',         icon: '✦',  label: 'Site Content' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-navy-2 border-r border-white/[0.06] flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="font-display text-lg tracking-widest text-white leading-none">
          BESPOKE BIKE TOURS
        </div>
        <div className="text-[9px] tracking-[3px] text-gold uppercase mt-0.5">Admin Console</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6">
        <div className="text-[9px] tracking-[3px] uppercase text-muted px-6 mb-3">Dashboard</div>
        {NAV.map(({ href, icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-6 py-3.5 text-sm transition-all duration-150 border-l-[3px]',
                isActive
                  ? 'bg-gold/8 border-gold text-gold'
                  : 'border-transparent text-white/65 hover:bg-white/[0.03] hover:text-white'
              )}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}

        <div className="h-px bg-white/[0.06] mx-6 my-4" />
        <div className="text-[9px] tracking-[3px] uppercase text-muted px-6 mb-3">Site</div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-6 py-3.5 text-sm text-white/65
                     hover:text-white transition-colors border-l-[3px] border-transparent"
        >
          <span className="text-base w-5 text-center">↗</span>
          View Live Site
        </Link>
      </nav>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="flex items-center gap-3 px-6 py-4 text-sm text-muted hover:text-red-400
                   transition-colors border-t border-white/[0.06] w-full text-left"
      >
        <span className="text-base w-5 text-center">⎋</span>
        Sign Out
      </button>
    </aside>
  )
}
