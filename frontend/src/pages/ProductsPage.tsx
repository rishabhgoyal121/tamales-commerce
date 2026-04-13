import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { addCartItem, listProducts, type ProductListSort } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notify'

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

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => addCartItem(accessToken, { productId, quantity: 1 }),
    onSuccess: () => {
      setStatusMessage('Added item to cart from catalog.')
      notifySuccess('Added item to cart.')
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to add item to cart')
      setStatusMessage(message)
      notifyError(message)
    },
  })

  const products = productsQuery.data?.data ?? []
  const meta = productsQuery.data?.meta

  const canGoPrev = (meta?.page ?? page) > 1
  const canGoNext = meta ? meta.page < meta.totalPages : false

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
      navigate('/login')
      return
    }

    addToCartMutation.mutate(productId)
  }

  return (
    <>
      <Seo
        title="Products | Tamales Commerce"
        description="Browse and search products with server-side filters, sorting, and pagination."
      />
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Browse catalog with server-side filtering, sorting, and pagination.</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
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
                {products.map((product) => (
                  <article key={product.id} className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="overflow-hidden rounded-md bg-slate-100">
                      <img
                        src={productImageBySlug[product.slug] ?? 'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=900&q=80'}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{product.slug}</p>
                    <h3 className="mt-1 text-base font-semibold">{product.title}</h3>
                    <p className="mt-2 text-sm text-slate-700">{formatCurrency(product.priceCents)}</p>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addToCartMutation.isPending}
                    >
                      Add to Cart
                    </Button>
                  </article>
                ))}
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
