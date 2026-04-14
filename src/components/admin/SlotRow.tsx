'use client'
// src/components/admin/SlotRow.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { formatTime } from '@/lib/utils'

interface SlotRowProps {
  slot: {
    id: string
    date: Date
    startTime: string
    capacity: number
    isActive: boolean
    bookedCount: number
    availableCount: number
    tour: { name: string }
  }
}

export function SlotRow({ slot }: SlotRowProps) {
  const router = useRouter()
  const [capacity, setCapacity] = useState(slot.capacity)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pct = Math.round((slot.bookedCount / slot.capacity) * 100)
  const isFull = slot.bookedCount >= slot.capacity

  async function saveCapacity() {
    if (capacity === slot.capacity) return
    setSaving(true)
    await fetch(`/api/admin/slots/${slot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capacity }),
    })
    setSaving(false)
    router.refresh()
  }

  async function deleteSlot() {
    if (!confirm('Remove this slot? This cannot be undone.')) return
    setDeleting(true)
    setError(null)
    const res = await fetch(`/api/admin/slots/${slot.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      setDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-4 whitespace-nowrap">
        {format(new Date(slot.date), 'MMM d, yyyy')}
      </td>
      <td className="px-5 py-4 whitespace-nowrap">{formatTime(slot.startTime)}</td>
      <td className="px-5 py-4">{slot.tour.name}</td>

      {/* Editable capacity */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="field text-sm py-1.5 w-16 text-center"
            min={slot.bookedCount}
            max={50}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            onBlur={saveCapacity}
          />
          {saving && <span className="text-xs text-muted">saving…</span>}
        </div>
      </td>

      <td className="px-5 py-4 text-center">{slot.bookedCount}</td>

      {/* Available with colour */}
      <td className={`px-5 py-4 text-center font-semibold
                      ${isFull ? 'text-red-400' : slot.availableCount <= 3 ? 'text-gold' : 'text-green-400'}`}>
        {slot.availableCount}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <span className={isFull ? 'badge badge-full' : 'badge badge-open'}>
          {isFull ? 'Full' : 'Open'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        {error && <p className="text-red-400 text-xs mb-1">{error}</p>}
        <button
          onClick={deleteSlot}
          disabled={deleting}
          className="btn-danger py-1.5 px-3 text-xs"
        >
          {deleting ? 'Removing…' : 'Remove'}
        </button>
      </td>
    </tr>
  )
}
