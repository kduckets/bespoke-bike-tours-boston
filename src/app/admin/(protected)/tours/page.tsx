import { prisma } from '@/lib/prisma'
import { ToursEditor } from '@/components/admin/ToursEditor'

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <div className="text-[9px] tracking-[3px] uppercase text-gold mb-1">Admin</div>
        <h1 className="font-display text-5xl tracking-widest">TOURS</h1>
        <p className="text-muted text-sm mt-1">Manage tour offerings, pricing, and capacity settings.</p>
      </div>

      <ToursEditor initial={tours} />
    </div>
  )
}
