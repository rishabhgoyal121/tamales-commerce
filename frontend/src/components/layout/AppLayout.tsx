import { useMemo, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCart } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'

const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'My Orders' },
  { to: '/checkout-preview', label: 'Checkout' },
]

const categoryLinks = [
  { to: '/products?q=headphones', label: 'Audio' },
  { to: '/products?q=keyboard', label: 'Work Setup' },
  { to: '/products?q=lamp', label: 'Home' },
  { to: '/products?q=dumbbell', label: 'Fitness' },
  { to: '/products?q=book', label: 'Books' },
  { to: '/products?q=toy', label: 'Toys' },
]

function quickLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-2 py-1.5 text-sm transition',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')
  const [mobilePaneOpen, setMobilePaneOpen] = useState(false)
  const {
    isAuthenticated,
    user,
    signOut,
    busy,
    accessToken,
  } = useAuthSession()

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

  const handleTopSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchValue.trim()
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products')
    setMobilePaneOpen(false)
  }

  return (
    <main
      className={cn(
        'min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900',
        showStickyCheckout ? 'pb-28 sm:pb-12' : '',
      )}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-3 py-3 sm:px-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 lg:hidden"
            onClick={() => setMobilePaneOpen(true)}
            aria-label="Open navigation"
          >
            ≡
          </button>
          <Link to="/" className="shrink-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Tamales</p>
            <p className="text-lg font-semibold leading-none text-slate-900">Marketplace</p>
          </Link>
          <form onSubmit={handleTopSearch} className="hidden flex-1 md:flex md:items-center md:gap-2">
            <Input
              id="top-search-input"
              name="search"
              type="search"
              autoComplete="off"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search products, brands, and categories"
              className="h-10 bg-white"
            />
            <Button type="submit" className="h-10 px-4">
              Search
            </Button>
          </form>
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
                >
                  Cart ({cartItemCount})
                </Link>
                <details className="group relative">
                  <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-100">
                    {(user?.email?.[0] ?? 'U').toUpperCase()}
                  </summary>
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="mb-2 rounded-md bg-slate-50 p-2">
                      <p className="truncate text-xs font-semibold text-slate-900">{user?.email}</p>
                      <p className="text-xs text-slate-600">{user?.role}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/cart"
                      className="block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      My Cart
                    </Link>
                    {user?.role === 'ADMIN' ? (
                      <Link
                        to="/admin"
                        className="block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        Admin Panel
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="mt-1 block w-full rounded-md px-2 py-1.5 text-left text-sm text-rose-700 hover:bg-rose-50"
                      onClick={() => void signOut()}
                      disabled={busy}
                    >
                      Logout
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_280px]">
          <aside className="hidden lg:block">
            <Card className="animate-fade-up border-slate-200/80 bg-white/95 p-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Navigation</p>
              <nav className="mt-3 flex flex-col gap-1">
                {primaryLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={quickLinkClassName}>
                    {link.label}
                  </NavLink>
                ))}
                {user?.role === 'ADMIN' ? (
                  <>
                    <NavLink to="/admin" className={quickLinkClassName}>
                      Admin Home
                    </NavLink>
                    <NavLink to="/admin/catalog" className={quickLinkClassName}>
                      Admin Catalog
                    </NavLink>
                    <NavLink to="/admin/orders" className={quickLinkClassName}>
                      Admin Orders
                    </NavLink>
                  </>
                ) : null}
              </nav>
              <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Quick Categories</p>
              <nav className="mt-3 flex flex-col gap-1">
                {categoryLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={quickLinkClassName}>
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </Card>
          </aside>

          <section className="min-w-0">
            <Outlet />
          </section>

          <aside className="hidden xl:block">
            <Card className="animate-fade-up border-slate-200/80 bg-white/95 p-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Side Pane</p>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-sm font-semibold text-slate-900">Cart Snapshot</p>
                <p className="mt-1 text-sm text-slate-600">
                  {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(cartSubtotalCents)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/cart"
                    className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    Open Cart
                  </Link>
                  <Link
                    to="/checkout-preview"
                    className="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Checkout
                  </Link>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">Deals & Help</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  <li>Free shipping on orders over $50</li>
                  <li>SAVE10 coupon available at checkout</li>
                  <li>Need support? Check your order history</li>
                </ul>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <footer className="mt-8 border-t border-slate-200 bg-white/90">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-3 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold">Tamales Marketplace</p>
            <p className="mt-2 text-xs text-slate-600">A modern marketplace for everyday shopping.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Customer</p>
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
              <Link to="/products" className="hover:text-slate-900">Browse products</Link>
              <Link to="/cart" className="hover:text-slate-900">Cart</Link>
              <Link to="/orders" className="hover:text-slate-900">Orders</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Admin</p>
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
              <Link to="/admin" className="hover:text-slate-900">Admin home</Link>
              <Link to="/admin/catalog" className="hover:text-slate-900">Catalog</Link>
              <Link to="/admin/orders" className="hover:text-slate-900">Orders</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Policies</p>
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
              <p>Privacy Policy</p>
              <p>Terms of Use</p>
              <p>Returns & Refunds</p>
            </div>
          </div>
        </div>
        <p className="border-t border-slate-200 px-3 py-3 text-center text-xs text-slate-500 sm:px-6">
          © 2026 Tamales Commerce. All rights reserved.
        </p>
      </footer>

      {mobilePaneOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobilePaneOpen(false)}
            aria-label="Close side pane"
          />
          <div className="absolute left-0 top-0 h-full w-[290px] animate-slide-up overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Menu</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200"
                onClick={() => setMobilePaneOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleTopSearch} className="mt-4 flex gap-2">
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products"
              />
              <Button type="submit">Go</Button>
            </form>

            <div className="mt-5 space-y-1">
              {primaryLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={quickLinkClassName}
                  onClick={() => setMobilePaneOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              {user?.role === 'ADMIN' ? (
                <>
                  <NavLink to="/admin" className={quickLinkClassName} onClick={() => setMobilePaneOpen(false)}>
                    Admin Home
                  </NavLink>
                  <NavLink to="/admin/catalog" className={quickLinkClassName} onClick={() => setMobilePaneOpen(false)}>
                    Admin Catalog
                  </NavLink>
                  <NavLink to="/admin/orders" className={quickLinkClassName} onClick={() => setMobilePaneOpen(false)}>
                    Admin Orders
                  </NavLink>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showStickyCheckout ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3">
          <div className="mx-auto flex w-full max-w-3xl animate-slide-up items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <div className="pointer-events-auto min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Quick Checkout</p>
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
