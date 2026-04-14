'use client'
// src/components/admin/AddSlotForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tour } from '@prisma/client'

const TIMES = ['08:00', '10:00', '12:00', '14:00', '17:00', '19:00']

export function AddSlotForm({ tours }: { tours: Tour[] }) {
  const router = useRouter()
  const [tourId, setTourId] = useState(tours[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [capacity, setCapacity] = useState(12)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleAdd() {
    if (!date || !tourId) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, date, startTime, capacity }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to add slot')
    } else {
      setSuccess(true)
      setDate('')
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {/* Tour */}
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">Tour</label>
          <select className="field text-sm py-2.5" value={tourId} onChange={(e) => setTourId(e.target.value)}>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">Date</label>
          <input
            type="date"
            className="field text-sm py-2.5"
            min={new Date().toISOString().split('T')[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">Start Time</label>
          <select className="field text-sm py-2.5" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">Capacity</label>
          <input
            type="number"
            className="field text-sm py-2.5"
            min={1}
            max={50}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            onClick={handleAdd}
            disabled={loading || !date}
            className="btn-sm w-full py-2.5"
          >
            {loading ? 'Adding…' : '+ Add Slot'}
          </button>
        </div>
      </div>

      {error   && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">✓ Slot added successfully</p>}
    </div>
  )
}
