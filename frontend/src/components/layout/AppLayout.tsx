import { NavLink, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function navClassName({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  }`
}

export function AppLayout() {
  const { isAuthenticated, user, statusMessage, signOut, busy } = useAuthSession()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="border-slate-200/80 bg-white/90 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Tamales Commerce
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Fullstack Learning Console</h1>
                <p className="text-sm text-muted-foreground">
                  Production-style architecture with API, core, service, and DB layers.
                </p>
              </div>
              {isAuthenticated ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">{user?.email}</Badge>
                  <Badge variant="outline">{user?.role}</Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void signOut()}
                    disabled={busy}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Badge variant="warning">Guest Session</Badge>
              )}
            </div>

            <nav className="mt-5 flex flex-wrap items-center gap-2">
              <NavLink to="/products" className={navClassName}>
                Products
              </NavLink>
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className={navClassName}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={navClassName}>
                    Sign Up
                  </NavLink>
                </>
              ) : null}
              <NavLink to="/cart" className={navClassName}>
                Cart
              </NavLink>
              <NavLink to="/orders" className={navClassName}>
                My Orders
              </NavLink>
              <NavLink to="/checkout-preview" className={navClassName}>
                Checkout Preview
              </NavLink>
              <NavLink to="/admin" className={navClassName}>
                Admin
              </NavLink>
              {user?.role === 'ADMIN' ? (
                <NavLink to="/admin/orders" className={navClassName}>
                  Admin Orders
                </NavLink>
              ) : null}
            </nav>

            <Alert className="mt-5">
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        <Outlet />
      </section>
    </main>
  )
}
