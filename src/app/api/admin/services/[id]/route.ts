import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  badge:     z.string().min(1).optional(),
  title:     z.string().min(1).optional(),
  desc:      z.string().min(1).optional(),
  price:     z.string().min(1).optional(),
  unit:      z.string().min(1).optional(),
  featured:  z.boolean().optional(),
  isActive:  z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const service = await prisma.service.update({ where: { id }, data: body.data })
  revalidatePath('/')
  return NextResponse.json(service)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.service.delete({ where: { id } })
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
