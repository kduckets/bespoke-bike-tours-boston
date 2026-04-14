// src/app/api/admin/promos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PromoType } from '@prisma/client'

const PromoSchema = z.object({
  code: z.string().min(2).max(32).toUpperCase(),
  type: z.nativeEnum(PromoType),
  value: z.number().int().positive(), // percentage (1–100) or cents
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(), // ISO date string
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(promos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data = PromoSchema.parse(body)

  const promo = await prisma.promoCode.create({
    data: {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  })
  return NextResponse.json(promo, { status: 201 })
}

// src/app/api/admin/promos/[id]/route.ts
export async function PATCH(req: NextRequest) {
  // handled in [id]/route.ts below
  return NextResponse.json({ error: 'Use /api/admin/promos/:id' }, { status: 405 })
}
