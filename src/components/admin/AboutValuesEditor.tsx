'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AboutValue {
  id: string
  title: string
  desc: string
  isActive: boolean
  sortOrder: number
}

interface Props {
  initial: AboutValue[]
}

const blank = { title: '', desc: '', sortOrder: 0 }

export function AboutValuesEditor({ initial }: Props) {
  const router = useRouter()
  const [values, setValues] = useState<AboutValue[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<AboutValue>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)

  function setEdit(key: string, value: string | number | boolean) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  async function handleAdd() {
    setSaving(true)
    const res = await fetch('/api/admin/about/values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFields),
    })
    if (res.ok) {
      const created = await res.json()
      setValues(v => [...v, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/about/values/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
    if (res.ok) {
      const updated = await res.json()
      setValues(v => v.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/about/values/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setValues(v => v.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this value?')) return
    const res = await fetch(`/api/admin/about/values/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setValues(v => v.filter(x => x.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">Our Values</h2>
          <p className="text-sm text-muted">Shown in the "What We Stand For" section of the About page.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-outline text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widest uppercase text-gold mb-2">New Value</div>
          <input className="admin-input w-full" placeholder="Title (e.g. Fun First)" value={newFields.title} onChange={e => setNewFields(f => ({ ...f, title: e.target.value }))} />
          <textarea className="admin-input w-full h-24 resize-none" placeholder="Description…" value={newFields.desc} onChange={e => setNewFields(f => ({ ...f, desc: e.target.value }))} />
          <label className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
            <input type="number" className="admin-input w-32" value={newFields.sortOrder} onChange={e => setNewFields(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add Value'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {values.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No values yet — add one above.</p>
        )}
        {values.map((v, i) => (
          <div key={v.id} className={`border rounded p-5 space-y-3 transition-opacity ${v.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === v.id ? (
              <>
                <input className="admin-input w-full" value={editFields.title ?? v.title} onChange={e => setEdit('title', e.target.value)} />
                <textarea className="admin-input w-full h-24 resize-none" value={editFields.desc ?? v.desc} onChange={e => setEdit('desc', e.target.value)} />
                <label className="block">
                  <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
                  <input type="number" className="admin-input w-32" value={editFields.sortOrder ?? v.sortOrder} onChange={e => setEdit('sortOrder', Number(e.target.value))} />
                </label>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(v.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-gold/30">0{i + 1}</span>
                    <span className="font-semibold text-sm">{v.title}</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed max-w-xl">{v.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggle(v.id, !v.isActive)}
                    className={`text-xs px-2 py-1 rounded ${v.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                  >
                    {v.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => { setEditingId(v.id); setEditFields({}) }} className="text-xs text-iris-2 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(v.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
