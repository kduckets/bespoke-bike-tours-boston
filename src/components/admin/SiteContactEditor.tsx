'use client'
import { useState } from 'react'

interface Props {
  initial: Record<string, string>
}

export function SiteContactEditor({ initial }: Props) {
  const [fields, setFields] = useState({
    contact_email:            initial.contact_email            ?? '',
    contact_phone:            initial.contact_phone            ?? '',
    contact_location:         initial.contact_location         ?? '',
    contact_hours:            initial.contact_hours            ?? '',
    contact_instagram_handle: initial.contact_instagram_handle ?? '',
    contact_instagram_url:    initial.contact_instagram_url    ?? '',
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

  const rows: { key: keyof typeof fields; label: string; placeholder: string; type?: string }[] = [
    { key: 'contact_email',            label: 'Email',              placeholder: 'hello@bespokebikeboston.com', type: 'email' },
    { key: 'contact_phone',            label: 'Phone',              placeholder: '(617) 555-0190' },
    { key: 'contact_location',         label: 'Location',           placeholder: 'The Esplanade, Hatch Shell' },
    { key: 'contact_hours',            label: 'Hours',              placeholder: 'Daily 9 AM – 7 PM' },
    { key: 'contact_instagram_handle', label: 'Instagram Handle',   placeholder: '@bespokebikeboston' },
    { key: 'contact_instagram_url',    label: 'Instagram URL',      placeholder: 'https://instagram.com/bespokebikeboston', type: 'url' },
  ]

  return (
    <div className="card p-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-wide mb-1">Contact Info</h2>
        <p className="text-sm text-muted">Shown on the Contact page under "Find Us".</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {rows.map(({ key, label, placeholder, type }) => (
          <label key={key} className="block">
            <span className="text-[11px] tracking-widests uppercase text-muted block mb-1.5">{label}</span>
            <input
              type={type ?? 'text'}
              className="admin-input w-full"
              value={fields[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Contact Info'}
        </button>
        {status === 'saved' && <span className="text-sm text-green-400">Saved!</span>}
        {status === 'error' && <span className="text-sm text-red-400">Something went wrong</span>}
      </div>
    </div>
  )
}
