'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { HugeiconsIcon } from '@hugeicons/react'
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createSupabaseBrowserClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    try {
      const roleRes = await fetch('/api/check-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: data.user.id })
      })
      const { isAdmin } = await roleRes.json()

      if (!isAdmin) {
        await supabase.auth.signOut()
        setError('Access denied. Admins only.')
        setLoading(false)
        return
      }

      window.location.href = '/orders'
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold text-white">
            Ship<span className="text-orange-500">ixa</span>
          </span>
          <p className="text-white/40 text-sm mt-2">Admin Portal</p>
        </div>

        <div className="bg-[#141418] rounded-2xl border border-white/10 p-8">
          <h1 className="text-xl font-extrabold text-white mb-1">Sign in</h1>
          <p className="text-white/60 text-sm mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Email</label>
              <input
                type="text"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">Password</label>
              <div className="flex items-center gap-2 bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-400">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-white/40 hover:text-white/70 shrink-0 transition"
                >
                  <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={17} color="currentColor" />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-red-400 text-xs">⚠</span>
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f2662d] hover:brightness-105 text-black py-3 rounded-xl font-bold text-sm transition  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          Restricted access. Authorised personnel only.
        </p>
      </div>
    </div>
  )
}
