'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TeamMember {
  id: string
  initials: string
  name: string
  role: string
  bio: string
  photoUrl: string | null
  color: string
  isActive: boolean
  sortOrder: number
}

interface Props {
  initial: TeamMember[]
}

const COLORS = ['purple', 'gold', 'iris'] as const
const blank = { initials: '', name: '', role: '', bio: '', photoUrl: null as string | null, color: 'purple', sortOrder: 0 }

export function AboutTeamEditor({ initial }: Props) {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<TeamMember>>({})
  const [adding, setAdding] = useState(false)
  const [newFields, setNewFields] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const newPhotoRef = useRef<HTMLInputElement>(null)
  const editPhotoRef = useRef<HTMLInputElement>(null)

  function setEdit(key: string, value: string | number | boolean | null) {
    setEditFields(f => ({ ...f, [key]: value }))
  }

  async function handleUploadPhoto(forNew: boolean, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      if (forNew) setNewFields(f => ({ ...f, photoUrl: data.url }))
      else setEdit('photoUrl', data.url)
    }
    setUploading(false)
  }

  async function handleAdd() {
    setSaving(true)
    const res = await fetch('/api/admin/about/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFields),
    })
    if (res.ok) {
      const created = await res.json()
      setMembers(m => [...m, created])
      setNewFields(blank)
      setAdding(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/about/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFields),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembers(m => m.map(x => x.id === id ? updated : x))
      setEditingId(null)
      router.refresh()
    }
    setSaving(false)
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/about/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setMembers(m => m.map(x => x.id === id ? { ...x, isActive } : x))
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this team member?')) return
    const res = await fetch(`/api/admin/about/team/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMembers(m => m.filter(x => x.id !== id))
      router.refresh()
    }
  }

  function PhotoField({ url, onUpload, onClear, inputRef }: {
    url: string | null; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClear: () => void; inputRef: React.MutableRefObject<HTMLInputElement | null>
  }) {
    return (
      <div>
        <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Photo</span>
        <div className="flex items-center gap-3">
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Guide photo" className="h-14 w-14 object-cover rounded-full border border-white/10" />
          )}
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="btn-outline text-xs px-3 py-1.5">
            {uploading ? 'Uploading…' : url ? 'Change Photo' : 'Upload Photo'}
          </button>
          {url && (
            <button type="button" onClick={onClear} className="text-xs text-red-400 hover:text-red-300">Remove</button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onUpload} />
      </div>
    )
  }

  return (
    <div className="card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide mb-1">Guide</h2>
          <p className="text-sm text-muted">Shown on the About page. Add a photo for best results.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-outline text-sm px-4 py-2">
          + Add
        </button>
      </div>

      {adding && (
        <div className="border border-gold/20 rounded p-5 bg-gold/5 space-y-4">
          <div className="text-[11px] tracking-widests uppercase text-gold mb-2">New Guide</div>
          <PhotoField
            url={newFields.photoUrl}
            onUpload={(e) => handleUploadPhoto(true, e)}
            onClear={() => setNewFields(f => ({ ...f, photoUrl: null }))}
            inputRef={newPhotoRef}
          />
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Initials (max 4)</span>
              <input className="admin-input w-full" maxLength={4} placeholder="MR" value={newFields.initials} onChange={e => setNewFields(f => ({ ...f, initials: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Color (avatar fallback)</span>
              <select className="admin-input w-full" value={newFields.color} onChange={e => setNewFields(f => ({ ...f, color: e.target.value }))}>
                {COLORS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </label>
          </div>
          <input className="admin-input w-full" placeholder="Full Name" value={newFields.name} onChange={e => setNewFields(f => ({ ...f, name: e.target.value }))} />
          <input className="admin-input w-full" placeholder="Role / Title" value={newFields.role} onChange={e => setNewFields(f => ({ ...f, role: e.target.value }))} />
          <textarea className="admin-input w-full h-24 resize-none" placeholder="Bio…" value={newFields.bio} onChange={e => setNewFields(f => ({ ...f, bio: e.target.value }))} />
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Add Guide'}
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {members.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No guide yet — add one above.</p>
        )}
        {members.map(m => (
          <div key={m.id} className={`border rounded p-5 space-y-3 transition-opacity ${m.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            {editingId === m.id ? (
              <>
                <PhotoField
                  url={(editFields.photoUrl !== undefined ? editFields.photoUrl : m.photoUrl)}
                  onUpload={(e) => handleUploadPhoto(false, e)}
                  onClear={() => setEdit('photoUrl', null)}
                  inputRef={editPhotoRef}
                />
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Initials</span>
                    <input className="admin-input w-full" maxLength={4} value={editFields.initials ?? m.initials} onChange={e => setEdit('initials', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-[11px] tracking-widests uppercase text-muted block mb-1">Color</span>
                    <select className="admin-input w-full" value={editFields.color ?? m.color} onChange={e => setEdit('color', e.target.value)}>
                      {COLORS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </label>
                </div>
                <input className="admin-input w-full" value={editFields.name ?? m.name} onChange={e => setEdit('name', e.target.value)} />
                <input className="admin-input w-full" value={editFields.role ?? m.role} onChange={e => setEdit('role', e.target.value)} />
                <textarea className="admin-input w-full h-24 resize-none" value={editFields.bio ?? m.bio} onChange={e => setEdit('bio', e.target.value)} />
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(m.id)} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-outline text-sm px-4 py-2">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-sm tracking-widests shrink-0 ${
                      m.color === 'gold' ? 'bg-gold/15 text-gold' :
                      m.color === 'iris' ? 'bg-iris/20 text-iris-2' :
                      'bg-purple-2/30 text-iris-2'
                    }`}>
                      {m.initials}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[11px] tracking-widests uppercase text-gold">{m.role}</div>
                    <p className="text-xs text-muted mt-1 leading-relaxed max-w-lg">{m.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggle(m.id, !m.isActive)}
                    className={`text-xs px-2 py-1 rounded ${m.isActive ? 'text-green-400 border border-green-400/30' : 'text-muted border border-white/10'}`}
                  >
                    {m.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => { setEditingId(m.id); setEditFields({}) }} className="text-xs text-iris-2 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
