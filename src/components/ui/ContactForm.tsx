'use client'
// src/components/ui/ContactForm.tsx
import { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactForm() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [subject, setSubject] = useState('General Inquiry')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<Status>('idle')

  const SUBJECTS = [
    'General Inquiry',
    'Group / Private Event',
    'Booking Help',
    'Cancellation / Refund',
    'Press & Media',
    'Other',
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    try {
      // In production: POST to /api/contact which sends via Resend
      // For now we simulate a short delay
      await new Promise((r) => setTimeout(r, 1200))
      setStatus('sent')
      setName(''); setEmail(''); setMessage('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <div className="font-semibold text-green-400 mb-2">Message sent!</div>
        <p className="text-sm text-muted">We'll get back to you within a few hours.</p>
        <button onClick={() => setStatus('idle')} className="btn-ghost mt-6 text-xs">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Name</label>
          <input className="field" type="text" required autoComplete="name"
            placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Email</label>
          <input className="field" type="email" required autoComplete="email"
            placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Subject</label>
        <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">Message</label>
        <textarea className="field" rows={5} required
          placeholder="Tell us what's on your mind…"
          value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">Something went wrong — please email us directly.</p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
            Sending…
          </span>
        ) : 'Send Message ✦'}
      </button>
    </form>
  )
}
