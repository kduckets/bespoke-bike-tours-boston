'use client'
// src/app/error.tsx
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to your error tracking service (e.g. Sentry) here
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="font-display text-8xl text-gold/20 mb-4">500</div>
        <h1 className="font-display text-4xl tracking-wide mb-3">Something went wrong</h1>
        <p className="text-muted text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          We hit an unexpected snag. Try refreshing — if it keeps happening,
          shoot us an email at{' '}
          <a href="mailto:hello@bespokebikeboston.com" className="text-gold hover:underline">
            hello@bespokebikeboston.com
          </a>
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/" className="btn-outline">Go Home</Link>
        </div>
        {error.digest && (
          <p className="text-xs text-muted/50 mt-6 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
