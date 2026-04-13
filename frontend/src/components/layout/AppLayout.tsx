import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCart } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

function navClassName({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  }`
}

export function AppLayout() {
  const location = useLocation()
  const { isAuthenticated, user, statusMessage, signOut, busy, accessToken } = useAuthSession()

  const cartSummaryQuery = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: () => getCart(accessToken),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 15_000,
  })

  const cartItems = cartSummaryQuery.data?.data.items ?? []
  const cartItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )
  const cartSubtotalCents = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0),
    [cartItems],
  )
  const showStickyCheckout =
    isAuthenticated && cartItemCount > 0 && !location.pathname.startsWith('/checkout-preview')

  return (
    <main
      className={cn(
        'min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-6 text-slate-900 sm:px-6 sm:py-8',
        showStickyCheckout ? 'pb-28 sm:pb-10' : '',
      )}
    >
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <Card className="animate-fade-up border-slate-200/80 bg-white/90 backdrop-blur">
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
              <NavLink to="/" className={navClassName}>
                Home
              </NavLink>
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
      {showStickyCheckout ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3">
          <div className="mx-auto flex w-full max-w-3xl animate-slide-up items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="pointer-events-auto min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Quick Checkout
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} • {formatCurrency(cartSubtotalCents)}
              </p>
            </div>
            <div className="pointer-events-auto flex shrink-0 gap-2">
              <Link
                to="/cart"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium transition hover:bg-slate-50"
              >
                Cart
              </Link>
              <Link
                to="/checkout-preview"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
