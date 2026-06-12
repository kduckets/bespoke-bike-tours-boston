'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from './RichTextEditor'

interface Props {
  initial: { about_quote: string; about_body: string }
}

export function AboutHeroEditor({ initial }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/site-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="card p-8 space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-wide mb-1">Hero Content</h2>
        <p className="text-sm text-muted">The pull quote and body copy shown at the top of the About page.</p>
      </div>

      <label className="block">
        <span className="text-[11px] tracking-[3px] uppercase text-muted block mb-1">Pull Quote</span>
        <RichTextEditor
          value={fields.about_quote}
          onChange={html => setFields(f => ({ ...f, about_quote: html }))}
          minHeight={80}
        />
      </label>

      <label className="block">
        <span className="text-[11px] tracking-[3px] uppercase text-muted block mb-1">Body Copy</span>
        <RichTextEditor
          value={fields.about_body}
          onChange={html => setFields(f => ({ ...f, about_body: html }))}
          minHeight={128}
        />
      </label>

      <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  )
}
