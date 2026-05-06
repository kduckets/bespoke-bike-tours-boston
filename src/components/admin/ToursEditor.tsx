'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Tour {
  id: string
  slug: string
  name: string
  description: string
  duration: string
  maxCapacity: number
  pricePerPerson: number
  groupBasePrice: number | null
  isActive: boolean
}

interface Props {
  initial: Tour[]
}

const blank = {
  slug: '',
  name: '',
  description: '',
  duration: '',
  maxCapacity: 12,
  pricePerPerson: '',
  groupBasePrice: '',
  isActive: true,
}

function centsToDisplay(cents: number) {
  return (cents / 100).toString()
}

function displayToCents(val: string) {
  const n = parseFloat(val)
  return isNaN(n) ? 0 : Math.round(n * 100)
}

export function ToursEditor({ initial }: Props) {
  const router = useRouter()
  const [tours, setTours] = useState<Tour[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<Tour & { priceDisplay: string; groupBasePriceDisplay: string }>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setEdit(key: string, value: string | number | boolean | null) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  function startEdit(tour: Tour) {
    setEditingId(tour.id)
    setEditFields({
      ...tour,
      priceDisplay: centsToDisplay(tour.pricePerPerson),
      groupBasePriceDisplay: tour.groupBasePrice != null ? centsToDisplay(tour.groupBasePrice) : '',
    })
    setError(null)
  }

  async function handleAdd() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newFields,
        pricePerPerson: displayToCents(String(newFields.pricePerPerson)),
        groupBasePrice: newFields.groupBasePrice !== '' ? displayToCents(String(newFields.groupBasePrice)) : null,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setTours(t => [...t, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : 'Failed to create tour.')
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    setError(null)
    const priceDisplay = (editFields as { priceDisplay?: string }).priceDisplay
    const groupDisplay = (editFields as { groupBasePriceDisplay?: string }).groupBasePriceDisplay
    const payload: Record<string, unknown> = { ...editFields }
    delete payload.priceDisplay
    delete payload.groupBasePriceDisplay
    if (priceDisplay !== undefined) payload.pricePerPerson = displayToCents(priceDisplay)
    if (groupDisplay !== undefined) payload.groupBasePrice = groupDisplay !== '' ? displayToCents(groupDisplay) : null

    const res = await fetch(`/api/admin/tours/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated = await res.json()
      setTours(t => t.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : 'Failed to save tour.')
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/tours/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setTours(t => t.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tour? This cannot be undone.')) return
    const res = await fetch(`/api/admin/tours/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTours(t => t.filter(x => x.id !== id))
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(typeof data.error === 'string' ? data.error : 'Failed to delete tour.')
    }
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">Tours</h2>
          <p className="text-sm text-muted">Manage tour offerings, pricing, and availability settings.</p>
        </div>
        <button onClick={() => { setAdding(true); setError(null) }} className="btn-outline text-sm px-4 py-2">
          + Add Tour
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-3">
          {error}
        </div>
      )}

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widest uppercase text-gold mb-2">New Tour</div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widest uppercase text-muted block mb-1">Name</span>
              <input className="admin-input w-full" placeholder="The Main Event" value={newFields.name} onChange={e => setNewFields(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Slug</span>
              <input className="admin-input w-full" placeholder="main-event" value={newFields.slug} onChange={e => setNewFields(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Description</span>
            <textarea className="admin-input w-full h-20 resize-none" placeholder="A brief tour description…" value={newFields.description} onChange={e => setNewFields(f => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Duration</span>
              <input className="admin-input w-full" placeholder="2.5 hours" value={newFields.duration} onChange={e => setNewFields(f => ({ ...f, duration: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Max Capacity</span>
              <input type="number" min={1} className="admin-input w-full" value={newFields.maxCapacity} onChange={e => setNewFields(f => ({ ...f, maxCapacity: Number(e.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Price / Person ($)</span>
              <input type="number" min={0} step="0.01" className="admin-input w-full" placeholder="75.00" value={newFields.pricePerPerson} onChange={e => setNewFields(f => ({ ...f, pricePerPerson: e.target.value }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Group Base Price ($) <span className="normal-case text-white/30">— optional, for private tours</span></span>
            <input type="number" min={0} step="0.01" className="admin-input w-full" placeholder="450.00" value={newFields.groupBasePrice} onChange={e => setNewFields(f => ({ ...f, groupBasePrice: e.target.value }))} />
          </label>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add Tour'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tours.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No tours yet — add one above.</p>
        )}
        {tours.map(tour => (
          <div key={tour.id} className={`border rounded p-5 space-y-3 transition-opacity ${tour.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === tour.id ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Name</span>
                    <input className="admin-input w-full" value={editFields.name ?? tour.name} onChange={e => setEdit('name', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Slug</span>
                    <input className="admin-input w-full" value={editFields.slug ?? tour.slug} onChange={e => setEdit('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Description</span>
                  <textarea className="admin-input w-full h-20 resize-none" value={editFields.description ?? tour.description} onChange={e => setEdit('description', e.target.value)} />
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Duration</span>
                    <input className="admin-input w-full" value={editFields.duration ?? tour.duration} onChange={e => setEdit('duration', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Max Capacity</span>
                    <input type="number" min={1} className="admin-input w-full" value={editFields.maxCapacity ?? tour.maxCapacity} onChange={e => setEdit('maxCapacity', Number(e.target.value))} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Price / Person ($)</span>
                    <input
                      type="number" min={0} step="0.01" className="admin-input w-full"
                      value={(editFields as { priceDisplay?: string }).priceDisplay ?? centsToDisplay(tour.pricePerPerson)}
                      onChange={e => setEdit('priceDisplay', e.target.value)}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Group Base Price ($) <span className="normal-case text-white/30">— optional</span></span>
                  <input
                    type="number" min={0} step="0.01" className="admin-input w-full"
                    value={(editFields as { groupBasePriceDisplay?: string }).groupBasePriceDisplay ?? (tour.groupBasePrice != null ? centsToDisplay(tour.groupBasePrice) : '')}
                    onChange={e => setEdit('groupBasePriceDisplay', e.target.value)}
                  />
                </label>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(tour.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold tracking-wide">{tour.name}</div>
                    <div className="text-[11px] text-muted mt-0.5 font-mono">{tour.slug}</div>
                    <p className="text-sm text-white/60 mt-1 leading-relaxed">{tour.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display text-2xl text-gold leading-none">${(tour.pricePerPerson / 100).toFixed(0)}</div>
                    <div className="text-[11px] text-muted mt-0.5">per person</div>
                    {tour.groupBasePrice != null && (
                      <div className="text-[11px] text-muted mt-0.5">+${(tour.groupBasePrice / 100).toFixed(0)} group base</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>{tour.duration}</span>
                  <span>·</span>
                  <span>Up to {tour.maxCapacity} riders</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleToggle(tour.id, !tour.isActive)}
                    className={`text-xs px-2 py-1 rounded ${tour.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                  >
                    {tour.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => startEdit(tour)} className="text-xs text-iris-2 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(tour.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
