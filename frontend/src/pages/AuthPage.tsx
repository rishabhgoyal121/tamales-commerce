import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'

type AuthMode = 'login' | 'register'

export function AuthPage() {
  const { busy, submitAuth, checkMe, refresh, checkAdmin, isAuthenticated } = useAuthSession()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('learner@tamales.dev')
  const [password, setPassword] = useState('strongpass123')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitAuth(mode, email, password)
  }

  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Authentication</h2>
      <p className="mt-1 text-sm text-slate-600">
        Sign in and test protected/authenticated endpoints.
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          variant={mode === 'login' ? 'default' : 'outline'}
          onClick={() => setMode('login')}
          disabled={busy}
        >
          Login
        </Button>
        <Button
          variant={mode === 'register' ? 'default' : 'outline'}
          onClick={() => setMode('register')}
          disabled={busy}
        >
          Register
        </Button>
      </div>

      <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <Button type="submit" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      {isAuthenticated ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button onClick={() => void checkMe()} disabled={busy}>
            Call /auth/me
          </Button>
          <Button onClick={() => void refresh()} disabled={busy} variant="outline">
            Refresh Session
          </Button>
          <Button onClick={() => void checkAdmin()} disabled={busy} variant="secondary">
            Admin Check
          </Button>
        </div>
      ) : null}
    </article>
  )
}
