'use client'
import { useState, useRef } from 'react'

interface Props {
  initial: Record<string, string>
}

export function SiteHeroEditor({ initial }: Props) {
  const [fields, setFields] = useState({
    hero_tagline:     initial.hero_tagline     ?? '',
    hero_line1:       initial.hero_line1       ?? '',
    hero_line2:       initial.hero_line2       ?? '',
    hero_line3:       initial.hero_line3       ?? '',
    hero_subheadline: initial.hero_subheadline ?? '',
    hero_image_url:   initial.hero_image_url   ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: string, value: string) =>
    setFields(f => ({ ...f, [key]: value }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) set('hero_image_url', data.url)
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setStatus('idle')
    const res = await fetch('/api/admin/site-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSaving(false)
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="card p-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-wide mb-1">Hero Section</h2>
        <p className="text-sm text-muted">Controls the full-screen hero on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Pill Tagline</span>
          <input
            className="admin-input w-full"
            value={fields.hero_tagline}
            onChange={e => set('hero_tagline', e.target.value)}
            placeholder="✦ Est. 2025 · Boston, MA ✦"
          />
        </label>

        <div className="grid grid-cols-3 gap-4">
          {(['hero_line1', 'hero_line2', 'hero_line3'] as const).map((key, i) => (
            <label key={key} className="block">
              <span className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">
                Headline Line {i + 1}{i === 1 ? ' (gold shimmer)' : ''}
              </span>
              <input
                className="admin-input w-full font-display tracking-wide"
                value={fields[key]}
                onChange={e => set(key, e.target.value)}
              />
            </label>
          ))}
        </div>

        <label className="block">
          <span className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Sub-headline</span>
          <input
            className="admin-input w-full"
            value={fields.hero_subheadline}
            onChange={e => set('hero_subheadline', e.target.value)}
          />
        </label>

        <div>
          <span className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Hero Background Image</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-outline text-sm px-4 py-2"
            >
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>
            {fields.hero_image_url && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fields.hero_image_url}
                  alt="Hero preview"
                  className="h-12 w-20 object-cover rounded border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => set('hero_image_url', '')}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            )}
            {!fields.hero_image_url && (
              <span className="text-xs text-muted">No image set — particle animation shown</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Hero'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-400">Saved!</span>}
        {status === 'error' && <span className="text-sm text-red-400">Something went wrong</span>}
      </div>
    </div>
  )
}
