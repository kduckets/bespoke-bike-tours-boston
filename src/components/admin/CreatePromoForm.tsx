'use client'
// src/components/admin/CreatePromoForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PromoType } from '@prisma/client'

export function CreatePromoForm() {
  const router = useRouter()
  const [code, setCode]       = useState('')
  const [type, setType]       = useState<PromoType>(PromoType.PERCENTAGE)
  const [value, setValue]     = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expires, setExpires] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleCreate() {
    if (!code || !value) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.toUpperCase(),
        type,
        value: type === PromoType.PERCENTAGE
          ? Number(value)
          : Math.round(Number(value) * 100), // convert dollars to cents
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expires || null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to create promo code')
    } else {
      setSuccess(true)
      setCode(''); setValue(''); setMaxUses(''); setExpires('')
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">Code</label>
        <input
          className="field uppercase"
          placeholder="e.g. SUMMER20"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </div>

      <div>
        <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">
          Discount Type
        </label>
        <div className="flex gap-2">
          {([PromoType.PERCENTAGE, PromoType.FIXED_AMOUNT] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-xs font-semibold tracking-widest uppercase
                           rounded border transition-all
                           ${type === t
                             ? 'border-gold bg-gold/10 text-gold'
                             : 'border-white/10 text-muted hover:text-white'}`}
            >
              {t === PromoType.PERCENTAGE ? '% Off' : '$ Off'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">
            {type === PromoType.PERCENTAGE ? 'Percent (1–100)' : 'Amount ($)'}
          </label>
          <input
            type="number"
            className="field"
            placeholder={type === PromoType.PERCENTAGE ? '20' : '25.00'}
            min={type === PromoType.PERCENTAGE ? 1 : 0.5}
            max={type === PromoType.PERCENTAGE ? 100 : undefined}
            step={type === PromoType.PERCENTAGE ? 1 : 0.01}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">
            Max Uses (blank = ∞)
          </label>
          <input
            type="number"
            className="field"
            placeholder="100"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] tracking-[2px] uppercase text-muted mb-1.5">
          Expiry Date (optional)
        </label>
        <input
          type="date"
          className="field"
          min={new Date().toISOString().split('T')[0]}
          value={expires}
          onChange={(e) => setExpires(e.target.value)}
        />
      </div>

      {error   && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">✓ Promo code created</p>}

      <button
        onClick={handleCreate}
        disabled={loading || !code || !value}
        className="btn-sm w-full"
      >
        {loading ? 'Creating…' : '+ Create Code'}
      </button>
    </div>
  )
}
