'use client'
import dynamic from 'next/dynamic'

export const InlineBookingWidgetClient = dynamic(
  () => import('./InlineBookingWidget').then((m) => m.InlineBookingWidget),
  { ssr: false }
)
