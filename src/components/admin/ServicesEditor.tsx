'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  badge: string
  title: string
  desc: string
  price: string
  unit: string
  featured: boolean
  isActive: boolean
  sortOrder: number
}

interface Props {
  initial: Service[]
}

const blank = { badge: '', title: '', desc: '', price: '', unit: '', featured: false, sortOrder: 0 }

export function ServicesEditor({ initial }: Props) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<Service>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setEdit(key: string, value: string | number | boolean) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  async function handleAdd() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFields),
    })
    if (res.ok) {
      const created = await res.json()
      setServices(s => [...s, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : 'Failed to create service.')
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
    if (res.ok) {
      const updated = await res.json()
      setServices(s => s.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    } else {
      const data = await res.json()
      setError(typeof data.error === 'string' ? data.error : 'Failed to save service.')
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setServices(s => s.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service card?')) return
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setServices(s => s.filter(x => x.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">Services</h2>
          <p className="text-sm text-muted">Homepage service cards — displayed in the strip below the hero.</p>
        </div>
        <button onClick={() => { setAdding(true); setError(null) }} className="btn-outline text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-3">
          {error}
        </div>
      )}

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widests uppercase text-gold mb-2">New Service Card</div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Badge</span>
              <input className="admin-input w-full" placeholder="★ Most Popular" value={newFields.badge} onChange={e => setNewFields(f => ({ ...f, badge: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Title</span>
              <input className="admin-input w-full" placeholder="THE MAIN EVENT" value={newFields.title} onChange={e => setNewFields(f => ({ ...f, title: e.target.value }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Description</span>
            <textarea className="admin-input w-full h-20 resize-none" placeholder="A brief description…" value={newFields.desc} onChange={e => setNewFields(f => ({ ...f, desc: e.target.value }))} />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Price</span>
              <input className="admin-input w-full" placeholder="$75" value={newFields.price} onChange={e => setNewFields(f => ({ ...f, price: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Unit</span>
              <input className="admin-input w-full" placeholder="/ person" value={newFields.unit} onChange={e => setNewFields(f => ({ ...f, unit: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
              <input type="number" className="admin-input w-full" value={newFields.sortOrder} onChange={e => setNewFields(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </label>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-gold"
              checked={newFields.featured}
              onChange={e => setNewFields(f => ({ ...f, featured: e.target.checked }))}
            />
            <span className="text-sm text-white/80">Featured <span className="text-muted">(highlights this card with a gold top bar)</span></span>
          </label>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add Service'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No service cards yet — add one above.</p>
        )}
        {services.map(s => (
          <div key={s.id} className={`border rounded p-5 space-y-3 transition-opacity ${s.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === s.id ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Badge</span>
                    <input className="admin-input w-full" value={editFields.badge ?? s.badge} onChange={e => setEdit('badge', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Title</span>
                    <input className="admin-input w-full" value={editFields.title ?? s.title} onChange={e => setEdit('title', e.target.value)} />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Description</span>
                  <textarea className="admin-input w-full h-20 resize-none" value={editFields.desc ?? s.desc} onChange={e => setEdit('desc', e.target.value)} />
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Price</span>
                    <input className="admin-input w-full" value={editFields.price ?? s.price} onChange={e => setEdit('price', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Unit</span>
                    <input className="admin-input w-full" value={editFields.unit ?? s.unit} onChange={e => setEdit('unit', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
                    <input type="number" className="admin-input w-full" value={editFields.sortOrder ?? s.sortOrder} onChange={e => setEdit('sortOrder', Number(e.target.value))} />
                  </label>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-gold"
                    checked={editFields.featured ?? s.featured}
                    onChange={e => setEdit('featured', e.target.checked)}
                  />
                  <span className="text-sm text-white/80">Featured</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(s.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] tracking-[3px] uppercase text-gold mb-1">{s.badge}</div>
                    <div className="font-display text-xl tracking-wide">{s.title}</div>
                    <p className="text-sm text-white/60 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display text-2xl text-gold leading-none">{s.price}</div>
                    <div className="text-[11px] text-muted mt-0.5">{s.unit}</div>
                    {s.featured && <div className="text-[10px] text-gold/60 mt-1">★ featured</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">Sort: {s.sortOrder}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(s.id, !s.isActive)}
                      className={`text-xs px-2 py-1 rounded ${s.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                    >
                      {s.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button onClick={() => { setEditingId(s.id); setEditFields({}); setError(null) }} className="text-xs text-iris-2 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
