// src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as BookingStatus | null
  const page = Number(searchParams.get('page') ?? 1)
  const limit = 20

  const bookings = await prisma.booking.findMany({
    where: status ? { status } : {},
    include: { slot: { include: { tour: true } }, promoCode: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await prisma.booking.count({ where: status ? { status } : {} })

  return NextResponse.json({ bookings, total, page, limit })
}
