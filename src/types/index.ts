// src/types/index.ts
import type { Tour, TimeSlot, Booking, BookingStatus, PromoCode, PromoType } from '@prisma/client'

// ─── Re-exports from Prisma ───────────────────────────────────────────────────
export type { Tour, TimeSlot, Booking, BookingStatus, PromoCode, PromoType }

// ─── Enriched types ───────────────────────────────────────────────────────────

export type SlotWithBookings = TimeSlot & {
  tour: Tour
  _count: { bookings: number }
  bookedCount: number
  availableCount: number
}

export type BookingWithDetails = Booking & {
  slot: TimeSlot & { tour: Tour }
  promoCode: PromoCode | null
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface GuestDetail {
  firstName: string
  lastName: string
  email: string
  heightFeet: number
  heightInches: number
}

export interface CreateBookingPayload {
  slotId: string
  guestCount: number
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests?: string
  promoCode?: string
  guestsData?: GuestDetail[]
}

export interface BookingResult {
  bookingId: string
  reference: string
  clientSecret: string  // Stripe PaymentIntent client secret
  totalCents: number
}

export interface AvailabilityDay {
  date: string            // ISO date string
  slots: AvailableSlot[]
}

export interface AvailableSlot {
  id: string
  startTime: string
  capacity: number
  bookedCount: number
  availableCount: number
  tour: {
    id: string
    name: string
    slug: string
    pricePerPerson: number
    duration: string
  }
}

export interface PromoValidation {
  valid: boolean
  code?: string
  type?: PromoType
  value?: number          // percentage or cents
  discountCents?: number  // computed for given subtotal
  error?: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  revenueThisMonth: number
  bookingsThisMonth: number
  ridersThisMonth: number
  avgRating: number
  recentBookings: BookingWithDetails[]
  capacityOverview: SlotWithBookings[]
}
