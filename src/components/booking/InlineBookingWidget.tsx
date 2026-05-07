'use client'
// src/components/booking/InlineBookingWidget.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import type { AvailabilityDay } from '@/types'

export function InlineBookingWidget() {
  const router = useRouter()
  const [tourSlug, setTourSlug] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch tour slug once on mount — use first active tour
  useEffect(() => {
    fetch('/api/tours')
      .then((r) => r.json())
      .then((data: { slug: string }[]) => {
        if (data.length > 0) setTourSlug(data[0].slug)
      })
      .catch(() => {})
  }, [])

  // Fetch availability when tour is known
  useEffect(() => {
    if (!tourSlug) return
    setLoading(true)
    setSelectedDate('')
    fetch(`/api/availability?tour=${tourSlug}&days=30`)
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => {
        setAvailability(data)
        if (data.length > 0) setSelectedDate(data[0].date)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourSlug])

  function handleSubmit() {
    const params = new URLSearchParams({
      tour: tourSlug,
      guests,
      ...(selectedDate ? { date: selectedDate } : {}),
    })
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Date</label>
            <select
              className="field"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={loading || availability.length === 0}
            >
              {loading && <option>Loading…</option>}
              {!loading && availability.length === 0 && (
                <option>No dates available</option>
              )}
              {availability.map((a) => {
                const totalAvailable = a.slots.reduce((sum, s) => sum + s.availableCount, 0)
                return (
                  <option key={a.date} value={a.date}>
                    {format(parseISO(a.date), 'EEE, MMM d')} ({totalAvailable} spots)
                  </option>
                )
              })}
            </select>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Guests</label>
            <select
              className="field"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted opacity-0 select-none">Book</label>
            <button onClick={handleSubmit} disabled={loading || !tourSlug} className="btn-primary disabled:opacity-40">
              Check Availability →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
