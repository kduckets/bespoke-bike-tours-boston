'use client'
import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6">
      <div className="text-4xl mb-4">⚠</div>
      <h2 className="font-display text-3xl tracking-wide mb-2">Something went wrong</h2>
      <p className="text-muted text-sm mb-6 max-w-sm">
        There was a problem loading this page. This is usually a temporary database issue.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
      {error.digest && (
        <p className="text-[11px] text-white/20 mt-4">Error ID: {error.digest}</p>
      )}
    </div>
  )
}
