import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSession } from '@/hooks/useAuthSession'

export function LandingPage() {
  const { isAuthenticated } = useAuthSession()

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle className="text-3xl">Tamales Commerce</CardTitle>
        <CardDescription>
          A production-style ecommerce learning project: browse products, manage cart, preview checkout, and place real orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/products"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Browse Products
          </Link>
          {isAuthenticated ? (
            <Link
              to="/cart"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Go to Cart
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Create Account
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold">1. Discover</p>
            <p className="mt-1 text-xs text-muted-foreground">Public catalog browsing with filters and pagination.</p>
          </article>
          <article className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold">2. Shop</p>
            <p className="mt-1 text-xs text-muted-foreground">Authenticated cart with optimistic quantity updates.</p>
          </article>
          <article className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold">3. Checkout</p>
            <p className="mt-1 text-xs text-muted-foreground">Price preview + order placement with inventory and payment states.</p>
          </article>
        </div>
      </CardContent>
    </Card>
  )
}
