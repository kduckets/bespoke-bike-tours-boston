// src/app/admin/availability/page.tsx
import { prisma } from '@/lib/prisma'
import { format, startOfDay } from 'date-fns'
import { formatTime } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'
import { AddSlotForm } from '@/components/admin/AddSlotForm'
import { SlotRow } from '@/components/admin/SlotRow'

async function getSlots() {
  const slots = await prisma.timeSlot.findMany({
    where: { date: { gte: startOfDay(new Date()) } },
    include: {
      tour: true,
      _count: {
        select: {
          bookings: {
            where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED] } },
          },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return slots.map((s) => ({
    ...s,
    bookedCount: s._count.bookings,
    availableCount: s.capacity - s._count.bookings,
  }))
}

async function getTours() {
  return prisma.tour.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
}

export default async function AvailabilityPage() {
  const [slots, tours] = await Promise.all([getSlots(), getTours()])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-5xl tracking-wide">AVAILABILITY</h1>
        <span className="text-sm text-muted">{slots.length} upcoming slots</span>
      </div>

      {/* Add slot form */}
      <div className="card p-6 mb-6">
        <div className="text-[11px] tracking-[2px] uppercase text-muted mb-5">
          Add New Time Slot
        </div>
        <AddSlotForm tours={tours} />
      </div>

      {/* Slots table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Time', 'Tour', 'Capacity', 'Booked', 'Available', 'Status', 'Actions'].map((h) => (
                  <th key={h}
                      className="text-left px-5 py-3.5 text-[11px] tracking-[1px] uppercase
                                 text-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted text-sm">
                    No upcoming slots. Add one above.
                  </td>
                </tr>
              )}
              {slots.map((slot) => (
                <SlotRow key={slot.id} slot={slot} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
