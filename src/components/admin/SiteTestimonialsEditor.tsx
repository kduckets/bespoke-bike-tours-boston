'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Testimonial {
  id: string
  quote: string
  author: string
  location: string
  rating: number
  isActive: boolean
  sortOrder: number
}

interface Props {
  initial: Testimonial[]
}

const blank = { quote: '', author: '', location: '', rating: 5, sortOrder: 0 }

export function SiteTestimonialsEditor({ initial }: Props) {
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<Testimonial>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)

  function setEdit(key: string, value: string | number | boolean) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  async function handleAdd() {
    setSaving(true)
    const res = await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFields),
    })
    if (res.ok) {
      const created = await res.json()
      setTestimonials(t => [...t, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
    if (res.ok) {
      const updated = await res.json()
      setTestimonials(t => t.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setTestimonials(t => t.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTestimonials(t => t.filter(x => x.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">Testimonials</h2>
          <p className="text-sm text-muted">Shown on the homepage reviews section.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-outline text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widest uppercase text-gold mb-2">New Testimonial</div>
          <textarea
            className="admin-input w-full h-24 resize-none"
            placeholder="Quote…"
            value={newFields.quote}
            onChange={e => setNewFields(f => ({ ...f, quote: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <input className="admin-input" placeholder="Author (first name + last initial)" value={newFields.author} onChange={e => setNewFields(f => ({ ...f, author: e.target.value }))} />
            <input className="admin-input" placeholder="Location (e.g. New York, NY)" value={newFields.location} onChange={e => setNewFields(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widest uppercase text-muted block mb-1">Rating (1–5)</span>
              <input type="number" min={1} max={5} className="admin-input w-full" value={newFields.rating} onChange={e => setNewFields(f => ({ ...f, rating: Number(e.target.value) }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widest uppercase text-muted block mb-1">Sort Order</span>
              <input type="number" className="admin-input w-full" value={newFields.sortOrder} onChange={e => setNewFields(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add Testimonial'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {testimonials.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No testimonials yet — add one above.</p>
        )}
        {testimonials.map(t => (
          <div key={t.id} className={`border rounded p-5 space-y-3 transition-opacity ${t.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === t.id ? (
              <>
                <textarea
                  className="admin-input w-full h-24 resize-none"
                  value={editFields.quote ?? t.quote}
                  onChange={e => setEdit('quote', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input className="admin-input" value={editFields.author ?? t.author} onChange={e => setEdit('author', e.target.value)} />
                  <input className="admin-input" value={editFields.location ?? t.location} onChange={e => setEdit('location', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widest uppercase text-muted block mb-1">Rating</span>
                    <input type="number" min={1} max={5} className="admin-input w-full" value={editFields.rating ?? t.rating} onChange={e => setEdit('rating', Number(e.target.value))} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
                    <input type="number" className="admin-input w-full" value={editFields.sortOrder ?? t.sortOrder} onChange={e => setEdit('sortOrder', Number(e.target.value))} />
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(t.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-white/80 italic">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold tracking-widest uppercase text-iris-2">{t.author}</span>
                    <span className="text-xs text-muted ml-2">— {t.location}</span>
                    <span className="text-xs text-gold ml-2">{'★'.repeat(t.rating)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(t.id, !t.isActive)}
                      className={`text-xs px-2 py-1 rounded ${t.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                    >
                      {t.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button onClick={() => { setEditingId(t.id); setEditFields({}) }} className="text-xs text-iris-2 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
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
