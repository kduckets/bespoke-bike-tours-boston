// src/app/api/admin/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SlotSchema = z.object({
  tourId: z.string(),
  date: z.string(), // ISO date string
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(1).max(50),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slots = await prisma.timeSlot.findMany({
    where: { date: { gte: new Date() } },
    include: {
      tour: true,
      _count: {
        select: { bookings: { where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } } },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return NextResponse.json(slots)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { tourId, date, startTime, capacity } = SlotSchema.parse(body)

  const slot = await prisma.timeSlot.create({
    data: { tourId, date: new Date(date), startTime, capacity },
    include: { tour: true },
  })

  return NextResponse.json(slot, { status: 201 })
}

// src/app/api/admin/slots/[id]/route.ts — PATCH to update capacity, DELETE to remove
