import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  name:           z.string().min(1).optional(),
  description:    z.string().min(1).optional(),
  duration:       z.string().min(1).optional(),
  maxCapacity:    z.number().int().min(1).optional(),
  pricePerPerson: z.number().int().min(0).optional(),
  groupBasePrice: z.number().int().min(0).nullable().optional(),
  isActive:       z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const tour = await prisma.tour.update({ where: { id }, data: body.data })
  revalidatePath('/tours')
  revalidatePath('/book')
  return NextResponse.json(tour)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const bookingCount = await prisma.booking.count({
    where: {
      slot: { tourId: id },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
  })

  if (bookingCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${bookingCount} active booking(s) exist for this tour.` },
      { status: 409 }
    )
  }

  // Remove slots first (no active bookings at this point, so safe to cascade)
  await prisma.timeSlot.deleteMany({ where: { tourId: id } })
  await prisma.tour.delete({ where: { id } })
  revalidatePath('/tours')
  revalidatePath('/book')
  return NextResponse.json({ ok: true })
}
