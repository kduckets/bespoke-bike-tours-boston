'use client'
// src/components/admin/PromoToggle.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PromoToggle({ promoId, isActive }: { promoId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/promos/${promoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn-ghost py-1.5 px-3 text-xs transition-colors
                  ${isActive
                    ? 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                    : 'text-green-400 border-green-500/30 hover:bg-green-500/10'}`}
    >
      {loading ? '…' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
