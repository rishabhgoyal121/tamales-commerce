import { useMemo, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Seo } from '@/components/seo/Seo'
import { CategoryDealsGrid } from '@/components/marketplace/CategoryDealsGrid'
import { HeroCarousel } from '@/components/marketplace/HeroCarousel'
import { HorizontalProductCarousel } from '@/components/marketplace/HorizontalProductCarousel'
import { OfferTicker } from '@/components/marketplace/OfferTicker'
import { useAuthSession } from '@/hooks/useAuthSession'
import { addCartItem, listProducts } from '@/lib/auth-api'
import { categoryDeals, featuredDeals, heroSlides, quickOffers } from '@/lib/marketplace-data'
import { notifyError, notifyInfo, notifySuccessWithAction } from '@/lib/notify'

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, accessToken, setStatusMessage } = useAuthSession()
  const [searchText, setSearchText] = useState('')
  const [quickAddPendingId, setQuickAddPendingId] = useState<string | null>(null)

  const dealSections = useMemo(
    () => [
      { title: 'Today\'s Best Offers', products: featuredDeals.slice(0, 4) },
      { title: 'Popular in Electronics & Fitness', products: featuredDeals.slice(2, 6) },
    ],
    [],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchText.trim()
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products')
  }

  const quickAddMutation = useMutation({
    mutationFn: async (query: string) => {
      const catalog = await listProducts({ q: query, limit: 1, sort: 'createdAt_desc' })
      const first = catalog.data[0]
      if (!first) {
        throw new Error('No matching product found for quick add')
      }
      return addCartItem(accessToken, { productId: first.id, quantity: 1 })
    },
    onSuccess: () => {
      setStatusMessage('Item added to cart.')
      notifySuccessWithAction('Item added to cart.', {
        label: 'Open cart',
        onClick: () => navigate('/cart'),
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to quick add item'
      setStatusMessage(message)
      notifyError(message)
    },
    onSettled: () => {
      setQuickAddPendingId(null)
    },
  })

  const quickAddByHref = (itemId: string, href: string) => {
    if (!isAuthenticated) {
      const message = 'Please login to add to cart.'
      setStatusMessage(message)
      notifyInfo(message)
      navigate(`/login?next=${encodeURIComponent('/cart')}`)
      return
    }

    const query = href.includes('?') ? new URLSearchParams(href.split('?')[1]).get('q') : null
    if (!query?.trim()) {
      const message = 'Quick add is not available for this card yet.'
      setStatusMessage(message)
      notifyInfo(message)
      return
    }

    setQuickAddPendingId(itemId)
    quickAddMutation.mutate(query.trim())
  }

  return (
    <>
      <Seo
        title="Tamales Commerce | Marketplace"
        description="Browse deals, categories, and featured products in a production-style marketplace storefront."
      />

      <div className="space-y-4">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search products, categories, and brands"
                className="h-11 text-sm"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-yellow-400 px-5 text-sm font-semibold text-slate-900 transition hover:bg-yellow-300"
              >
                Search
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Try: headphones, keyboard, dumbbells, lamp
            </p>
          </CardContent>
        </Card>

        <HeroCarousel slides={heroSlides} />

        <OfferTicker offers={quickOffers} />

        <CategoryDealsGrid
          title="Shop By Category"
          items={categoryDeals}
          quickAddPendingId={quickAddPendingId}
          onQuickAdd={(item) => quickAddByHref(item.id, item.href)}
        />

        {dealSections.map((section) => (
          <HorizontalProductCarousel
            key={section.title}
            title={section.title}
            products={section.products}
            quickAddPendingId={quickAddPendingId}
            onQuickAdd={(product) => quickAddByHref(product.id, product.href)}
          />
        ))}

        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight">Start Shopping</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse products, add to cart, preview checkout, and place a complete order.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/products"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Explore Products
            </Link>
            {isAuthenticated ? (
              <Link
                to="/cart"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-muted"
              >
                Open Cart
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-muted"
              >
                Create Account
              </Link>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
