'use client'
// src/components/booking/InlineBookingWidget.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { formatTime, formatPrice } from '@/lib/utils'
import type { AvailabilityDay, AvailableSlot } from '@/types'

const TOURS = [
  { value: 'main-event',    label: 'The Main Event',   price: 7500 },
  { value: 'sunset-ride',   label: 'The Sunset Ride',  price: 8500 },
  { value: 'bike-lessons',  label: 'Bike Lessons',     price: 5500 },
  { value: 'private-group', label: 'Private Group',    price: 4500 },
]

const TABS = ['Individual / Couple', 'Group (6+)', 'Private Event'] as const

export function InlineBookingWidget() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [tourSlug, setTourSlug] = useState(TOURS[0].value)
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch availability whenever tour changes
  useEffect(() => {
    setLoading(true)
    setSelectedDate('')
    setSelectedSlotId('')
    fetch(`/api/availability?tour=${tourSlug}&days=30`)
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => {
        setAvailability(data)
        if (data.length > 0) setSelectedDate(data[0].date)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourSlug])

  // Reset slot when date changes
  useEffect(() => { setSelectedSlotId('') }, [selectedDate])

  const slotsForDate = availability.find((a) => a.date === selectedDate)?.slots ?? []

  function handleSubmit() {
    const params = new URLSearchParams({
      tour: tourSlug,
      guests,
      ...(selectedSlotId ? { slot: selectedSlotId } : {}),
      ...(selectedDate  ? { date: selectedDate }    : {}),
    })
    router.push(`/book?${params.toString()}`)
  }

  const selectedTour = TOURS.find((t) => t.value === tourSlug)!

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.08]">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-4 px-4 text-[11px] font-semibold tracking-widest uppercase
                        border-b-2 transition-all duration-200
                        ${i === activeTab
                          ? 'text-gold border-gold'
                          : 'text-muted border-transparent hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Tour */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Tour</label>
            <select
              className="field"
              value={tourSlug}
              onChange={(e) => setTourSlug(e.target.value)}
            >
              {TOURS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {formatPrice(t.price)}/person
                </option>
              ))}
            </select>
          </div>

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

          {/* Time */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Time</label>
            <select
              className="field"
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              disabled={!selectedDate || slotsForDate.length === 0}
            >
              <option value="">Any time</option>
              {slotsForDate.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatTime(slot.startTime)} ({slot.availableCount} left)
                </option>
              ))}
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
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 text-green-400 text-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 dot-pulse" />
          {loading ? 'Checking availability…' : 'Live availability — updates in real-time'}
        </div>

        <button onClick={handleSubmit} className="btn-primary">
          Check Availability & Book →
        </button>
      </div>
    </div>
  )
}
