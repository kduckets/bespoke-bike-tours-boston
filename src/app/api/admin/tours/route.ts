import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  name:           z.string().min(1),
  description:    z.string().min(1),
  duration:       z.string().min(1),
  maxCapacity:    z.number().int().min(1),
  pricePerPerson: z.number().int().min(0),
  groupBasePrice: z.number().int().min(0).nullable().optional(),
  isActive:       z.boolean().default(true),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(tours)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const tour = await prisma.tour.create({ data: body.data })
  revalidatePath('/tours')
  revalidatePath('/book')
  return NextResponse.json(tour, { status: 201 })
}
