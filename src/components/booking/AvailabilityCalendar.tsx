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
      .then((data: AvailabilityDay[]) => {
        setAvailability(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tourSlug])

  const availableDates = availability.map((a) => parseISO(a.date))
  const today = startOfDay(new Date())

  const slotsForSelectedDate = selectedDate
    ? availability.find(
        (a) => a.date === format(selectedDate, 'yyyy-MM-dd')
      )?.slots ?? []
    : []

  function handleDayClick(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const hasSlots = availability.some((a) => a.date === dateStr)
    if (!hasSlots || isBefore(day, today)) return
    setSelectedDate(day)
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

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-muted mb-3">
            Available Times — {format(selectedDate, 'EEEE, MMM d')}
          </h4>

          {slotsForSelectedDate.length === 0 ? (
            <p className="text-sm text-muted">No available times for this date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slotsForSelectedDate.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                const isFewLeft = slot.availableCount <= 3

                return (
                  <button
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className={`border rounded-lg p-4 text-center transition-all duration-200
                                ${isSelected
                                  ? 'border-gold bg-gold/8 text-gold font-semibold'
                                  : 'border-white/10 hover:border-iris hover:bg-iris/15'}`}
                  >
                    <div className="text-sm font-medium">{formatTime(slot.startTime)}</div>
                    <div className={`text-xs mt-1 ${isFewLeft ? 'text-gold' : 'text-muted'}`}>
                      {slot.availableCount} spot{slot.availableCount !== 1 ? 's' : ''} left
                      {isFewLeft && ' ⚡'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted">Select an available date above to see time slots.</p>
      )}
    </div>
  )
}
