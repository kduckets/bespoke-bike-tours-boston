import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  quote:     z.string().min(1).optional(),
  author:    z.string().min(1).optional(),
  location:  z.string().min(1).optional(),
  rating:    z.number().int().min(1).max(5).optional(),
  isActive:  z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data: body.data,
  })

  revalidatePath('/')
  return NextResponse.json(testimonial)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.testimonial.delete({ where: { id: params.id } })
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
