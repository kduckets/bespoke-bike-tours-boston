import { prisma } from '@/lib/prisma'
import { ServicesEditor } from '@/components/admin/ServicesEditor'

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <div className="text-[9px] tracking-[3px] uppercase text-gold mb-1">Admin · Site</div>
        <h1 className="font-display text-5xl tracking-widests">SERVICES</h1>
        <p className="text-muted text-sm mt-1">Manage the service cards shown in the homepage strip below the hero.</p>
      </div>

      <ServicesEditor initial={services} />
    </div>
  )
}
