'use client'
// src/components/admin/RefundModal.tsx
import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface Props {
  bookingId: string
  reference: string
  totalCents: number
}

export function RefundModal({ bookingId, reference, totalCents }: Props) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'FULL' | 'PARTIAL' | 'CREDIT'>('FULL')
  const [amountCents, setAmountCents] = useState(totalCents / 100)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        amountCents: type === 'FULL' ? undefined : Math.round(amountCents * 100),
        reason,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Refund failed')
    } else {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 2000)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-danger">
        Refund
      </button>

      {open && (
        /* Backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="card w-full max-w-md mx-4 p-8 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-white text-xl leading-none"
            >
              ✕
            </button>

            {success ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✓</div>
                <div className="text-green-400 font-semibold">Refund processed successfully</div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl tracking-wide mb-1">PROCESS REFUND</h2>
                <p className="text-xs text-muted mb-6">
                  {reference} · {formatPrice(totalCents, true)}
                </p>

                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
                      Refund Type
                    </label>
                    <div className="flex gap-2">
                      {(['FULL', 'PARTIAL', 'CREDIT'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={`flex-1 py-2 text-xs font-semibold tracking-widest uppercase
                                       rounded border transition-all
                                       ${type === t
                                         ? 'border-gold bg-gold/10 text-gold'
                                         : 'border-white/10 text-muted hover:text-white'}`}
                        >
                          {t.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount — only for partial */}
                  {type === 'PARTIAL' && (
                    <div>
                      <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        className="field"
                        min={0.50}
                        max={totalCents / 100}
                        step={0.01}
                        value={amountCents}
                        onChange={(e) => setAmountCents(Number(e.target.value))}
                      />
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
                      Reason (internal)
                    </label>
                    <textarea
                      className="field"
                      rows={3}
                      placeholder="Weather cancellation, customer request, duplicate booking…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20
                                  rounded px-4 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setOpen(false)} className="btn-outline flex-1">
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !reason}
                      className="flex-[2] py-3 px-6 rounded bg-red-500/80 hover:bg-red-500
                                  text-white text-xs font-bold tracking-widest uppercase
                                  transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing…' : `Process ${type.toLowerCase()} refund`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
