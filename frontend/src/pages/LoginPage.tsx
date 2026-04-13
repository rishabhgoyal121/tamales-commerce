import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'

export function LoginPage() {
  const { busy, submitAuth } = useAuthSession()
  const [email, setEmail] = useState('learner@tamales.dev')
  const [password, setPassword] = useState('strongpass123')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await submitAuth('login', email, password)
  }

  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Login</h2>
      <p className="mt-1 text-sm text-slate-600">Access your account to use cart and checkout.</p>

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
          {busy ? 'Please wait...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/signup" className="font-medium text-slate-900 underline">
          Create one
        </Link>
      </p>
    </article>
  )
}
