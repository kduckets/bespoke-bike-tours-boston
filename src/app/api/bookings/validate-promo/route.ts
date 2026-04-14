// src/app/api/bookings/validate-promo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validatePromoCode } from '@/lib/bookings'

export async function POST(req: NextRequest) {
  const { code, subtotalCents } = await req.json()
  if (!code || typeof subtotalCents !== 'number') {
    return NextResponse.json({ error: 'Missing code or subtotalCents' }, { status: 400 })
  }
  const result = await validatePromoCode(code, subtotalCents)
  return NextResponse.json(result)
}
