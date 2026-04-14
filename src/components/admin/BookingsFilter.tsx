'use client'
// src/components/admin/BookingsFilter.tsx
import { useRouter, useSearchParams } from 'next/navigation'

const FILTERS = ['ALL', 'CONFIRMED', 'PENDING', 'REFUNDED', 'CANCELLED']

export function BookingsFilter({ active }: { active: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', status)
    params.delete('page')
    router.push(`/admin/bookings?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 mb-5 bg-navy-2 border border-white/[0.06] rounded-lg p-1 w-fit">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => setStatus(f)}
          className={`px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-md
                       transition-all duration-150
                       ${active === f
                         ? 'bg-gold text-navy'
                         : 'text-muted hover:text-white'}`}
        >
          {f.toLowerCase().replace('_', ' ')}
        </button>
      ))}
    </div>
  )
}
