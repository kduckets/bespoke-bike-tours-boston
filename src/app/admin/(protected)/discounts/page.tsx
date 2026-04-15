// src/app/admin/discounts/page.tsx
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'
import { PromoType } from '@prisma/client'
import { CreatePromoForm } from '@/components/admin/CreatePromoForm'
import { PromoToggle } from '@/components/admin/PromoToggle'

async function getPromos() {
  return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
}

async function getRecentRefunds() {
  return prisma.refund.findMany({
    take: 10,
    orderBy: { issuedAt: 'desc' },
    include: { booking: true },
  })
}

export default async function DiscountsPage() {
  const [promos, refunds] = await Promise.all([getPromos(), getRecentRefunds()])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wide">DISCOUNTS & REFUNDS</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Create promo code */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-5">
            Create Promo Code
          </div>
          <CreatePromoForm />
        </div>

        {/* Recent refunds */}
        <div className="card p-6">
          <div className="text-[11px] tracking-[2px] uppercase text-muted mb-5">
            Recent Refunds
          </div>
          <div className="space-y-3">
            {refunds.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No refunds issued yet.</p>
            )}
            {refunds.map((r) => (
              <div key={r.id}
                   className="flex items-center justify-between p-4 bg-white/[0.03]
                               border border-white/[0.05] rounded-md text-sm">
                <div>
                  <div className="font-semibold">{r.booking.reference}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {r.type.toLowerCase()} · {r.reason.slice(0, 40)}{r.reason.length > 40 ? '…' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-semibold">−{formatPrice(r.amountCents, true)}</div>
                  <div className="text-xs text-muted">{format(new Date(r.issuedAt), 'MMM d')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active promo codes table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="text-[11px] tracking-[2px] uppercase text-muted">Active Promo Codes</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Code', 'Type', 'Value', 'Used', 'Limit', 'Expires', 'Status', ''].map((h) => (
                  <th key={h}
                      className="text-left px-5 py-3.5 text-[11px] tracking-[1px] uppercase
                                 text-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted text-sm">
                    No promo codes yet.
                  </td>
                </tr>
              )}
              {promos.map((p) => (
                <tr key={p.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono font-bold tracking-wider">{p.code}</td>
                  <td className="px-5 py-4 text-muted capitalize">
                    {p.type === PromoType.PERCENTAGE ? 'Percentage' : 'Fixed Amount'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gold">
                    {p.type === PromoType.PERCENTAGE
                      ? `${p.value}% off`
                      : `${formatPrice(p.value, true)} off`}
                  </td>
                  <td className="px-5 py-4">{p.usedCount}</td>
                  <td className="px-5 py-4 text-muted">{p.maxUses ?? '∞'}</td>
                  <td className="px-5 py-4 text-muted">
                    {p.expiresAt ? format(new Date(p.expiresAt), 'MMM d, yyyy') : 'No expiry'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={p.isActive ? 'badge badge-confirmed' : 'badge badge-cancelled'}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <PromoToggle promoId={p.id} isActive={p.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
