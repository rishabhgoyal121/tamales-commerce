import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SmartImage } from '@/components/common/SmartImage'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { addCartItem, getCart, listProducts, type ProductListSort } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { notifyError, notifyInfo, notifySuccessWithAction } from '@/lib/notify'

const SORT_OPTIONS: Array<{ value: ProductListSort; label: string }> = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'Title: A to Z' },
]

const productImageBySlug: Record<string, string> = {
  'wireless-headphones-pro':
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  'mechanical-keyboard-lite':
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
  'smart-desk-lamp':
    'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=900&q=80',
  'ceramic-coffee-mug-set':
    'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=900&q=80',
  'yoga-mat-grip-plus':
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  'adjustable-dumbbells-20kg':
    'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4f4?auto=format&fit=crop&w=900&q=80',
}

export function ProductsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const { accessToken, isAuthenticated, setStatusMessage } = useAuthSession()

  const [queryInput, setQueryInput] = useState(initialQuery)
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')

  const [query, setQuery] = useState(initialQuery)
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [sort, setSort] = useState<ProductListSort>('createdAt_desc')
  const [page, setPage] = useState(1)
  const limit = 12

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQueryInput(q)
    setQuery(q)
    setPage(1)
  }, [searchParams])

  const productsQuery = useQuery({
    queryKey: ['products', { query, minPrice, maxPrice, sort, page, limit }],
    queryFn: () =>
      listProducts({
        q: query || undefined,
        minPrice,
        maxPrice,
        sort,
        page,
        limit,
      }),
  })

  const cartQuery = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: () => getCart(accessToken),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 15_000,
  })

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => addCartItem(accessToken, { productId, quantity: 1 }),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', accessToken], data)
      setStatusMessage('Added item to cart from catalog.')
      notifySuccessWithAction('Added item to cart.', {
        label: 'Open cart',
        onClick: () => navigate('/cart'),
      })
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to add item to cart')
      setStatusMessage(message)
      notifyError(message)
    },
  })

  const products = productsQuery.data?.data ?? []
  const meta = productsQuery.data?.meta
  const cartProductIds = useMemo(
    () => new Set((cartQuery.data?.data.items ?? []).map((item) => item.productId)),
    [cartQuery.data?.data.items],
  )

  const canGoPrev = (meta?.page ?? page) > 1
  const canGoNext = meta ? meta.page < meta.totalPages : false
  const currentCatalogPath = `/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const appliedFiltersText = useMemo(() => {
    const bits: string[] = []
    if (query) bits.push(`search: "${query}"`)
    if (minPrice !== undefined) bits.push(`min: ${formatCurrency(minPrice)}`)
    if (maxPrice !== undefined) bits.push(`max: ${formatCurrency(maxPrice)}`)
    return bits.length > 0 ? bits.join(' | ') : 'No filters applied'
  }, [maxPrice, minPrice, query])

  const applyFilters = () => {
    const parsedMin = minPriceInput.trim() ? Number.parseInt(minPriceInput.trim(), 10) : undefined
    const parsedMax = maxPriceInput.trim() ? Number.parseInt(maxPriceInput.trim(), 10) : undefined

    if (parsedMin !== undefined && Number.isNaN(parsedMin)) {
      const message = 'Minimum price must be a valid number.'
      setStatusMessage(message)
      notifyError(message)
      return
    }
    if (parsedMax !== undefined && Number.isNaN(parsedMax)) {
      const message = 'Maximum price must be a valid number.'
      setStatusMessage(message)
      notifyError(message)
      return
    }
    if (parsedMin !== undefined && parsedMin < 0) {
      const message = 'Minimum price cannot be negative.'
      setStatusMessage(message)
      notifyError(message)
      return
    }
    if (parsedMax !== undefined && parsedMax < 0) {
      const message = 'Maximum price cannot be negative.'
      setStatusMessage(message)
      notifyError(message)
      return
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      const message = 'Minimum price cannot be greater than maximum price.'
      setStatusMessage(message)
      notifyError(message)
      return
    }

    const nextQuery = queryInput.trim()
    setQuery(nextQuery)
    setMinPrice(parsedMin)
    setMaxPrice(parsedMax)
    setPage(1)
    setSearchParams(nextQuery ? { q: nextQuery } : {})
    notifyInfo('Filters applied.')
  }

  const clearFilters = () => {
    setQueryInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setQuery('')
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSort('createdAt_desc')
    setPage(1)
    setSearchParams({})
    setStatusMessage('Catalog filters reset.')
    notifyInfo('Catalog filters reset.')
  }

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      const message = 'Please login to add products to cart.'
      setStatusMessage(message)
      notifyInfo(message)
      navigate(`/login?next=${encodeURIComponent(currentCatalogPath)}`)
      return
    }

    addToCartMutation.mutate(productId)
  }

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      const message = 'Please login to continue to checkout.'
      setStatusMessage(message)
      notifyInfo(message)
      navigate(`/login?next=${encodeURIComponent('/checkout-preview')}`)
      return
    }

    try {
      await addToCartMutation.mutateAsync(productId)
      navigate('/checkout-preview')
    } catch {
      // Handled by mutation onError.
    }
  }

  return (
    <>
      <Seo
        title="Products | Tamales Commerce"
        description="Browse and search products with server-side filters, sorting, and pagination."
      />
      <Card className="animate-fade-up border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Browse catalog, add quickly to cart, or use Buy Now for direct checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <section className="animate-fade-up rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="catalog-query">Search</Label>
                <Input
                  id="catalog-query"
                  placeholder="Search by title"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-min-price">Min price (cents)</Label>
                <Input
                  id="catalog-min-price"
                  type="number"
                  min={0}
                  value={minPriceInput}
                  onChange={(event) => setMinPriceInput(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-max-price">Max price (cents)</Label>
                <Input
                  id="catalog-max-price"
                  type="number"
                  min={0}
                  value={maxPriceInput}
                  onChange={(event) => setMaxPriceInput(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="catalog-sort">Sort</Label>
                <select
                  id="catalog-sort"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as ProductListSort)
                    setPage(1)
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={applyFilters}>Apply</Button>
              <Button variant="outline" onClick={clearFilters}>
                Reset
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">{appliedFiltersText}</p>
          </section>

          <section className="mt-4">
            {productsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading products...</p>
            ) : productsQuery.isError ? (
              <p className="text-sm text-destructive">
                {toStatusMessage(productsQuery.error, 'Failed to load products.')}
              </p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products found for current filters.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const isInCart = cartProductIds.has(product.id)

                  return (
                    <article
                      key={product.id}
                      className="animate-fade-up rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative overflow-hidden rounded-md bg-slate-100">
                        <Link to={`/products/${product.id}`}>
                          <SmartImage
                            src={productImageBySlug[product.slug] ?? 'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=900&q=80'}
                            alt={product.title}
                            loading="lazy"
                            decoding="async"
                            className="h-40 w-full object-cover"
                          />
                        </Link>
                        <button
                          type="button"
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white shadow transition hover:bg-slate-700"
                          title={isInCart ? 'Go to cart' : 'Add to cart'}
                          aria-label={isInCart ? `Go to cart for ${product.title}` : `Add ${product.title} to cart`}
                          onClick={() => {
                            if (isInCart) {
                              navigate('/cart')
                              return
                            }
                            handleAddToCart(product.id)
                          }}
                        >
                          {isInCart ? '→' : '+'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{product.slug}</p>
                      <h3 className="mt-1 text-base font-semibold">
                        <Link to={`/products/${product.id}`} className="hover:underline">
                          {product.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-slate-700">{formatCurrency(product.priceCents)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                          variant={isInCart ? 'default' : 'outline'}
                          onClick={() => {
                            if (isInCart) {
                              navigate('/cart')
                              return
                            }
                            handleAddToCart(product.id)
                          }}
                          disabled={addToCartMutation.isPending}
                        >
                          {isInCart ? 'Go to Cart' : 'Add to Cart'}
                        </Button>
                        <Button
                          className="animate-pulse-soft"
                          onClick={() => void handleBuyNow(product.id)}
                          disabled={addToCartMutation.isPending}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm">
            <p>
              Page {meta?.page ?? page} of {meta?.totalPages ?? 1} ({meta?.total ?? 0} items)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!canGoPrev || productsQuery.isFetching}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!canGoNext || productsQuery.isFetching}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </>
  )
}
