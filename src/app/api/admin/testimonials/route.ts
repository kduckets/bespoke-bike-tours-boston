import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  quote:     z.string().min(1),
  author:    z.string().min(1),
  location:  z.string().min(1),
  rating:    z.number().int().min(1).max(5).default(5),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const testimonial = await prisma.testimonial.create({ data: body.data })
  revalidatePath('/')
  return NextResponse.json(testimonial, { status: 201 })
}
