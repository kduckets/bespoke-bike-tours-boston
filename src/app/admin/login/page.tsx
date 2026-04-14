'use client'
// src/app/admin/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-3xl tracking-widest text-white">BESPOKE BIKE TOURS</div>
          <div className="text-[10px] tracking-[4px] uppercase text-gold mt-1">Admin Console</div>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-2xl tracking-wide mb-6">SIGN IN</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="field"
                placeholder="admin@bespokebikeboston.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[2px] uppercase text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20
                            rounded px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          <a href="/" className="hover:text-white transition-colors">← Back to site</a>
        </p>
      </div>
    </div>
  )
}
