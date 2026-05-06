import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  badge:     z.string().min(1),
  title:     z.string().min(1),
  desc:      z.string().min(1),
  price:     z.string().min(1),
  unit:      z.string().min(1),
  featured:  z.boolean().default(false),
  isActive:  z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const service = await prisma.service.create({ data: body.data })
  revalidatePath('/')
  return NextResponse.json(service, { status: 201 })
}
