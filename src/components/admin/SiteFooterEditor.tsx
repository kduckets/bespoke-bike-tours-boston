'use client'
import { useState } from 'react'

interface Props {
  initial: Record<string, string>
}

export function SiteFooterEditor({ initial }: Props) {
  const [fields, setFields] = useState({
    footer_tagline:   initial.footer_tagline   ?? '',
    footer_tiktok_url: initial.footer_tiktok_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const set = (key: string, value: string) =>
    setFields(f => ({ ...f, [key]: value }))

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
        <h2 className="font-display text-2xl tracking-wide mb-1">Footer</h2>
        <p className="text-sm text-muted">
          Brand tagline and social links shown in the site footer. Email, phone, and Instagram are pulled from{' '}
          <span className="text-gold">Contact Info</span> above.
        </p>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-[11px] tracking-widests uppercase text-muted block mb-1.5">Brand Tagline</span>
          <textarea
            className="admin-input w-full resize-none"
            rows={3}
            value={fields.footer_tagline}
            onChange={e => set('footer_tagline', e.target.value)}
            placeholder="A little bit of Vegas on two wheels…"
          />
        </label>

        <label className="block">
          <span className="text-[11px] tracking-widests uppercase text-muted block mb-1.5">TikTok URL</span>
          <input
            type="url"
            className="admin-input w-full"
            value={fields.footer_tiktok_url}
            onChange={e => set('footer_tiktok_url', e.target.value)}
            placeholder="https://tiktok.com/@bespokebikeboston"
          />
        </label>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Footer'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-400">Saved!</span>}
        {status === 'error' && <span className="text-sm text-red-400">Something went wrong</span>}
      </div>
    </div>
  )
}
