// src/app/api/admin/slots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PatchSchema = z.object({
  capacity: z.number().int().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = PatchSchema.parse(body)

  const slot = await prisma.timeSlot.update({
    where: { id: params.id },
    data,
    include: { tour: true, _count: { select: { bookings: true } } },
  })

  return NextResponse.json(slot)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check for existing confirmed bookings before deleting
  const bookingCount = await prisma.booking.count({
    where: {
      slotId: params.id,
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
  })

  if (bookingCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${bookingCount} active booking(s) exist for this slot.` },
      { status: 409 }
    )
  }

  await prisma.timeSlot.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
