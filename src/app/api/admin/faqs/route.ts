import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  question:  z.string().min(1),
  answer:    z.string().min(1),
  isActive:  z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(faqs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  const faq = await prisma.faq.create({ data: body.data })
  revalidatePath('/')
  return NextResponse.json(faq, { status: 201 })
}
