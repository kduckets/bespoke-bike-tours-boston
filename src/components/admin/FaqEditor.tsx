'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Faq {
  id: string
  question: string
  answer: string
  isActive: boolean
  sortOrder: number
}

interface Props {
  initial: Faq[]
}

const blank = { question: '', answer: '', sortOrder: 0 }

export function FaqEditor({ initial }: Props) {
  const router = useRouter()
  const [faqs, setFaqs] = useState<Faq[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<Faq>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)

  function setEdit(key: string, value: string | number | boolean) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  async function handleAdd() {
    setSaving(true)
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFields),
    })
    if (res.ok) {
      const created = await res.json()
      setFaqs(f => [...f, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/faqs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
    if (res.ok) {
      const updated = await res.json()
      setFaqs(f => f.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/faqs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setFaqs(f => f.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setFaqs(f => f.filter(x => x.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">FAQs</h2>
          <p className="text-sm text-muted">Shown on the homepage. Sorted by Sort Order.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-outline text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widest uppercase text-gold mb-2">New FAQ</div>
          <input className="admin-input w-full" placeholder="Question…" value={newFields.question} onChange={e => setNewFields(f => ({ ...f, question: e.target.value }))} />
          <textarea className="admin-input w-full h-28 resize-none" placeholder="Answer…" value={newFields.answer} onChange={e => setNewFields(f => ({ ...f, answer: e.target.value }))} />
          <label className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
            <input type="number" className="admin-input w-32" value={newFields.sortOrder} onChange={e => setNewFields(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
          </label>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add FAQ'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {faqs.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No FAQs yet — add one above.</p>
        )}
        {faqs.map(faq => (
          <div key={faq.id} className={`border rounded p-5 space-y-3 transition-opacity ${faq.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === faq.id ? (
              <>
                <input className="admin-input w-full" value={editFields.question ?? faq.question} onChange={e => setEdit('question', e.target.value)} />
                <textarea className="admin-input w-full h-28 resize-none" value={editFields.answer ?? faq.answer} onChange={e => setEdit('answer', e.target.value)} />
                <label className="block">
                  <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Sort Order</span>
                  <input type="number" className="admin-input w-32" value={editFields.sortOrder ?? faq.sortOrder} onChange={e => setEdit('sortOrder', Number(e.target.value))} />
                </label>
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(faq.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm mb-1">{faq.question}</div>
                  <p className="text-xs text-muted leading-relaxed max-w-xl">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggle(faq.id, !faq.isActive)}
                    className={`text-xs px-2 py-1 rounded ${faq.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                  >
                    {faq.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => { setEditingId(faq.id); setEditFields({}) }} className="text-xs text-iris-2 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(faq.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
