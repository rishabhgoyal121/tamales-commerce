import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { addCartItem, listProducts, type ProductListSort } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'

const SORT_OPTIONS: Array<{ value: ProductListSort; label: string }> = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'Title: A to Z' },
]

export function ProductsPage() {
  const navigate = useNavigate()
  const { accessToken, isAuthenticated, setStatusMessage } = useAuthSession()

  const [queryInput, setQueryInput] = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')

  const [query, setQuery] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [sort, setSort] = useState<ProductListSort>('createdAt_desc')
  const [page, setPage] = useState(1)
  const limit = 12

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
    },
    onError: (error) => {
      setStatusMessage(toStatusMessage(error, 'Failed to add item to cart'))
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
      setStatusMessage('Minimum price must be a valid number.')
      return
    }
    if (parsedMax !== undefined && Number.isNaN(parsedMax)) {
      setStatusMessage('Maximum price must be a valid number.')
      return
    }
    if (parsedMin !== undefined && parsedMin < 0) {
      setStatusMessage('Minimum price cannot be negative.')
      return
    }
    if (parsedMax !== undefined && parsedMax < 0) {
      setStatusMessage('Maximum price cannot be negative.')
      return
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setStatusMessage('Minimum price cannot be greater than maximum price.')
      return
    }

    setQuery(queryInput.trim())
    setMinPrice(parsedMin)
    setMaxPrice(parsedMax)
    setPage(1)
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
    setStatusMessage('Catalog filters reset.')
  }

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      setStatusMessage('Please login to add products to cart.')
      navigate('/login')
      return
    }

    addToCartMutation.mutate(productId)
  }

  return (
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
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
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
  )
}
