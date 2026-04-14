// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <div className="font-display text-[10rem] leading-none text-gold/10 mb-2
                        bg-gradient-to-b from-gold/20 to-transparent bg-clip-text">
          404
        </div>
        <h1 className="font-display text-5xl tracking-wide mb-3">Lost on the route?</h1>
        <p className="text-muted text-base max-w-sm mx-auto mb-10 leading-relaxed">
          This page doesn't exist — but Boston's best bike tour does.
          Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn-primary">Back to Home ✦</Link>
          <Link href="/tours" className="btn-outline">Browse Tours</Link>
        </div>
      </div>
    </div>
  )
}
