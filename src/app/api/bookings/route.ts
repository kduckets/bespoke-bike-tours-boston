// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBooking } from '@/lib/bookings'

const CreateBookingSchema = z.object({
  slotId: z.string().min(1),
  guestCount: z.number().int().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  specialRequests: z.string().max(500).optional(),
  promoCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const payload = CreateBookingSchema.parse(body)
    const result = await createBooking(payload)
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request', details: err.errors }, { status: 400 })
    }
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: err.message ?? 'Failed to create booking' }, { status: 400 })
  }
}
