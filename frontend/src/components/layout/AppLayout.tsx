import { NavLink, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Button } from '@/components/ui/button'

function navClassName({ isActive }: { isActive: boolean }) {
  return `rounded px-3 py-2 text-sm transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
  }`
}

export function AppLayout() {
  const { isAuthenticated, user, statusMessage, signOut, busy } = useAuthSession()

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">Tamales Commerce</p>
              <h1 className="text-xl font-semibold">Learning Console</h1>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                  {user?.email} ({user?.role})
                </span>
                <Button variant="destructive" size="sm" onClick={() => void signOut()} disabled={busy}>
                  Logout
                </Button>
              </div>
            ) : null}
          </div>

          <nav className="mt-4 flex flex-wrap items-center gap-2">
            <NavLink to="/auth" className={navClassName}>
              Auth
            </NavLink>
            <NavLink to="/cart" className={navClassName}>
              Cart
            </NavLink>
            <NavLink to="/checkout-preview" className={navClassName}>
              Checkout Preview
            </NavLink>
            <NavLink to="/admin" className={navClassName}>
              Admin
            </NavLink>
          </nav>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-medium">Status</p>
            <p className="mt-1">{statusMessage}</p>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  )
}
