// src/app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/bookings'
import { addDays, startOfDay } from 'date-fns'
import type { AvailabilityDay, AvailableSlot } from '@/types'
import { BookingStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tourSlug = searchParams.get('tour') ?? undefined
  const daysAhead = Number(searchParams.get('days') ?? '30')

  const from = startOfDay(new Date())
  const to = addDays(from, daysAhead)

  const slots = await getAvailableSlots(tourSlug, from, to)

  // Group by date for the calendar UI
  const byDate = new Map<string, AvailableSlot[]>()

  for (const slot of slots) {
    const bookedCount = slot._count.bookings
    const availableCount = slot.capacity - bookedCount
    // Skip fully-booked slots from public-facing response
    if (availableCount <= 0) continue

    const dateKey = slot.date.toISOString().split('T')[0]
    if (!byDate.has(dateKey)) byDate.set(dateKey, [])

    byDate.get(dateKey)!.push({
      id: slot.id,
      startTime: slot.startTime,
      capacity: slot.capacity,
      bookedCount,
      availableCount,
      tour: {
        id: slot.tour.id,
        name: slot.tour.name,
        slug: slot.tour.slug,
        pricePerPerson: slot.tour.pricePerPerson,
        duration: slot.tour.duration,
      },
    })
  }

  const result: AvailabilityDay[] = Array.from(byDate.entries()).map(([date, slots]) => ({
    date,
    slots,
  }))

  return NextResponse.json(result)
}
