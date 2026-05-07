import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  initials:  z.string().min(1).max(4),
  name:      z.string().min(1),
  role:      z.string().min(1),
  bio:       z.string().min(1),
  photoUrl:  z.string().url().optional().nullable(),
  color:     z.enum(['purple', 'gold', 'iris']).default('purple'),
  isActive:  z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = schema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })
  const member = await prisma.teamMember.create({ data: body.data })
  revalidatePath('/about')
  return NextResponse.json(member, { status: 201 })
}
