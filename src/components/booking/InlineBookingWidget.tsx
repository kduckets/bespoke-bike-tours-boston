'use client'
// src/components/booking/InlineBookingWidget.tsx
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import type { AvailabilityDay } from '@/types'
import 'react-day-picker/dist/style.css'

export function InlineBookingWidget() {
  const router = useRouter()
  const [tourSlug, setTourSlug] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/tours')
      .then((r) => r.json())
      .then((data: { slug: string }[]) => {
        if (data.length > 0) setTourSlug(data[0].slug)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tourSlug) return
    setLoading(true)
    setSelectedDate(undefined)
    fetch(`/api/availability?tour=${tourSlug}&days=60`)
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => {
        setAvailability(data)
        if (data.length > 0) setSelectedDate(parseISO(data[0].date))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourSlug])

  // Close calendar on outside click
  useEffect(() => {
    if (!calendarOpen) return
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [calendarOpen])

  const today = startOfDay(new Date())
  const availableDates = availability.map((a) => parseISO(a.date))

  function handleDayClick(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayData = availability.find((a) => a.date === dateStr)
    if (!dayData || isBefore(day, today)) return
    setSelectedDate(day)
    setCalendarOpen(false)
  }

  function handleSubmit() {
    const params = new URLSearchParams({
      tour: tourSlug,
      guests,
      ...(selectedDate ? { date: format(selectedDate, 'yyyy-MM-dd') } : {}),
    })
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div className="card">
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">

          {/* Date — popover calendar */}
          <div className="flex flex-col gap-2 relative" ref={wrapperRef}>
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Date</label>
            <button
              type="button"
              onClick={() => { if (!loading && availability.length > 0) setCalendarOpen((o) => !o) }}
              disabled={loading || availability.length === 0}
              className="field text-left flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className={selectedDate ? 'text-white' : 'text-muted'}>
                {loading
                  ? 'Loading…'
                  : selectedDate
                    ? format(selectedDate, 'EEE, MMM d')
                    : 'No dates available'}
              </span>
              <span className="text-muted text-xs ml-2">▾</span>
            </button>

            {calendarOpen && (
              <div className="
                mt-1 bg-[var(--navy-2)] border border-white/15 rounded-xl p-3
                sm:absolute sm:mt-0 sm:top-[calc(100%+6px)] sm:left-0 sm:z-50 sm:shadow-2xl
              ">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onDayClick={handleDayClick}
                  disabled={[
                    { before: today },
                    (date) => !availability.some((a) => a.date === format(date, 'yyyy-MM-dd')),
                  ]}
                  modifiers={{ available: availableDates }}
                  modifiersClassNames={{ available: 'available' }}
                  fromMonth={today}
                  toMonth={new Date(today.getFullYear(), today.getMonth() + 3)}
                />
              </div>
            )}
          </div>

          {/* Time note */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted opacity-0 select-none">Time</label>
            <div className="field flex items-center text-sm text-muted bg-transparent border-white/10 cursor-default select-none">
              ⏱ All rides at 10 AM
            </div>
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted">Guests</label>
            <select className="field" value={guests} onChange={(e) => setGuests(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-[2px] uppercase text-muted opacity-0 select-none">Book</label>
            <button
              onClick={handleSubmit}
              disabled={loading || !tourSlug}
              className="btn-primary disabled:opacity-40"
            >
              Check Availability →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
