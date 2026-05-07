'use client'
// src/components/booking/AvailabilityCalendar.tsx
import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { formatTime } from '@/lib/utils'
import type { AvailabilityDay, AvailableSlot } from '@/types'
import 'react-day-picker/dist/style.css'

interface Props {
  tourSlug: string
  onSelectSlot: (slot: AvailableSlot) => void
  selectedSlot: AvailableSlot | null
}

export function AvailabilityCalendar({ tourSlug, onSelectSlot, selectedSlot }: Props) {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/availability?tour=${tourSlug}&days=60`)
      .then((r) => r.json())
      .then((data: AvailabilityDay[]) => setAvailability(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourSlug])

  const availableDates = availability.map((a) => parseISO(a.date))
  const today = startOfDay(new Date())

  function handleDayClick(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayData = availability.find((a) => a.date === dateStr)
    if (!dayData || isBefore(day, today)) return

    setSelectedDate(day)

    // Auto-select 10am slot, or fall back to first available slot
    const preferred = dayData.slots.find((s) => s.startTime === '10:00')
    const slot = preferred ?? dayData.slots[0]
    if (slot) onSelectSlot(slot)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted text-sm">
        Loading availability…
      </div>
    )
  }

  return (
    <div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        disabled={[
          { before: today },
          (date) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            return !availability.some((a) => a.date === dateStr)
          },
        ]}
        modifiers={{
          available: availableDates,
          fewSpots: availability
            .filter((a) => a.slots.some((s) => s.availableCount <= 3))
            .map((a) => parseISO(a.date)),
        }}
        modifiersClassNames={{
          available: 'available',
          fewSpots: 'few-spots',
        }}
        fromMonth={today}
        toMonth={new Date(today.getFullYear(), today.getMonth() + 3)}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted mt-2 mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-white/20 bg-white/[0.04]" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border border-gold/30 bg-transparent" style={{ borderColor: 'var(--gold)' }} />
          <span className="text-gold">Few spots left</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gold" />
          Selected
        </span>
      </div>

      {selectedSlot && selectedDate && (
        <div className="flex items-center gap-3 bg-gold/8 border border-gold/20 rounded-lg px-4 py-3 text-sm">
          <span className="text-gold text-base">✓</span>
          <span>
            <span className="font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</span>
            <span className="text-muted ml-2">at {formatTime(selectedSlot.startTime)}</span>
            <span className="text-muted ml-2">· {selectedSlot.availableCount} spot{selectedSlot.availableCount !== 1 ? 's' : ''} left</span>
          </span>
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted">Select an available date above to continue.</p>
      )}
    </div>
  )
}
