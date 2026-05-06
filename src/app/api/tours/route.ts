import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: {
      slug: true,
      name: true,
      duration: true,
      maxCapacity: true,
      pricePerPerson: true,
      groupBasePrice: true,
    },
  })
  return NextResponse.json(tours)
}
