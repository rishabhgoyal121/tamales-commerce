import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import {
  createAdminProduct,
  listAdminCategories,
  listAdminProducts,
  updateAdminProduct,
  updateAdminProductInventory,
  type AdminProductListSort,
} from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notify'

const SORT_OPTIONS: Array<{ value: AdminProductListSort; label: string }> = [
  { value: 'updatedAt_desc', label: 'Recently Updated' },
  { value: 'createdAt_desc', label: 'Newest Created' },
  { value: 'createdAt_asc', label: 'Oldest Created' },
  { value: 'price_asc', label: 'Price Low to High' },
  { value: 'price_desc', label: 'Price High to Low' },
  { value: 'title_asc', label: 'Title A to Z' },
]

type NewProductFormState = {
  title: string
  slug: string
  description: string
  priceCents: string
  categoryId: string
  inventoryQty: string
  isActive: boolean
  isNsfw: boolean
}

const EMPTY_FORM: NewProductFormState = {
  title: '',
  slug: '',
  description: '',
  priceCents: '',
  categoryId: '',
  inventoryQty: '0',
  isActive: true,
  isNsfw: false,
}

export function AdminCatalogPage() {
  const queryClient = useQueryClient()
  const { accessToken, setStatusMessage } = useAuthSession()

  const [queryInput, setQueryInput] = useState('')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [sort, setSort] = useState<AdminProductListSort>('updatedAt_desc')
  const [page, setPage] = useState(1)
  const [newProduct, setNewProduct] = useState<NewProductFormState>(EMPTY_FORM)
  const [inventoryEdits, setInventoryEdits] = useState<Record<string, string>>({})

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => listAdminCategories(accessToken),
    enabled: !!accessToken,
  })

  const adminProductsQuery = useQuery({
    queryKey: ['admin-products', { query, activeFilter, sort, page }],
    queryFn: () =>
      listAdminProducts(accessToken, {
        q: query || undefined,
        isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
        sort,
        page,
        limit: 12,
      }),
    enabled: !!accessToken,
  })

  const products = adminProductsQuery.data?.data ?? []
  const meta = adminProductsQuery.data?.meta
  const canGoPrev = (meta?.page ?? page) > 1
  const canGoNext = meta ? meta.page < meta.totalPages : false

  const createProductMutation = useMutation({
    mutationFn: (payload: {
      title: string
      slug: string
      description: string
      priceCents: number
      categoryId: string
      inventoryQty: number
      isActive: boolean
      isNsfw: boolean
    }) => createAdminProduct(accessToken, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setStatusMessage('Product created successfully.')
      notifySuccess('Product created.')
      setNewProduct(EMPTY_FORM)
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to create product')
      setStatusMessage(message)
      notifyError(message)
    },
  })

  const updateInventoryMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number }) =>
      updateAdminProductInventory(accessToken, payload),
    onSuccess: (_result, payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setStatusMessage('Inventory updated.')
      notifySuccess('Inventory updated.')
      setInventoryEdits((prev) => ({ ...prev, [payload.productId]: '' }))
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to update inventory')
      setStatusMessage(message)
      notifyError(message)
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: (payload: { productId: string; isActive?: boolean; isNsfw?: boolean }) =>
      updateAdminProduct(accessToken, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setStatusMessage('Product status updated.')
      notifySuccess('Product status updated.')
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to update product status')
      setStatusMessage(message)
      notifyError(message)
    },
  })

  const categoryOptions = categoriesQuery.data?.data ?? []

  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (query) parts.push(`search="${query}"`)
    if (activeFilter !== 'ALL') parts.push(`status=${activeFilter.toLowerCase()}`)
    return parts.length ? parts.join(' | ') : 'No filters'
  }, [activeFilter, query])

  const handleCreateProduct = () => {
    const parsedPrice = Number.parseInt(newProduct.priceCents, 10)
    const parsedInventory = Number.parseInt(newProduct.inventoryQty, 10)
    if (!newProduct.title.trim() || !newProduct.slug.trim() || !newProduct.description.trim()) {
      notifyError('Title, slug, and description are required.')
      return
    }
    if (!newProduct.categoryId) {
      notifyError('Select a category.')
      return
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      notifyError('Price must be a non-negative integer.')
      return
    }
    if (Number.isNaN(parsedInventory) || parsedInventory < 0) {
      notifyError('Inventory must be a non-negative integer.')
      return
    }

    createProductMutation.mutate({
      title: newProduct.title.trim(),
      slug: newProduct.slug.trim(),
      description: newProduct.description.trim(),
      priceCents: parsedPrice,
      categoryId: newProduct.categoryId,
      inventoryQty: parsedInventory,
      isActive: newProduct.isActive,
      isNsfw: newProduct.isNsfw,
    })
  }

  return (
    <>
      <Seo
        title="Admin Catalog | Tamales Commerce"
        description="Create products and update inventory from the admin catalog workspace."
      />
      <Card className="animate-fade-up border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Admin Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <h3 className="text-sm font-semibold">Create Product</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newProduct.title}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-slug">Slug</Label>
                <Input
                  id="new-slug"
                  placeholder="lowercase-hyphen-slug"
                  value={newProduct.slug}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, slug: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-description">Description</Label>
                <Input
                  id="new-description"
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-price">Price (cents)</Label>
                <Input
                  id="new-price"
                  type="number"
                  min={0}
                  value={newProduct.priceCents}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, priceCents: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-inventory">Inventory qty</Label>
                <Input
                  id="new-inventory"
                  type="number"
                  min={0}
                  value={newProduct.inventoryQty}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, inventoryQty: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category">Category</Label>
                <select
                  id="new-category"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={newProduct.categoryId}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="new-active"
                  type="checkbox"
                  checked={newProduct.isActive}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                <Label htmlFor="new-active">Active product</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="new-nsfw"
                  type="checkbox"
                  checked={newProduct.isNsfw}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, isNsfw: event.target.checked }))
                  }
                />
                <Label htmlFor="new-nsfw">Mark as 18+</Label>
              </div>
            </div>
            <div className="mt-3">
              <Button
                onClick={handleCreateProduct}
                disabled={createProductMutation.isPending || categoriesQuery.isLoading}
              >
                {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="catalog-q">Search</Label>
                <Input
                  id="catalog-q"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.target.value)}
                  placeholder="Search by title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-active">Status</Label>
                <select
                  id="catalog-active"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                    setPage(1)
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-sort">Sort</Label>
                <select
                  id="catalog-sort"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as AdminProductListSort)
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
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => {
                  setQuery(queryInput.trim())
                  setPage(1)
                  notifyInfo('Admin product filters applied.')
                }}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setQueryInput('')
                  setQuery('')
                  setActiveFilter('ALL')
                  setSort('updatedAt_desc')
                  setPage(1)
                }}
              >
                Reset
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{filterSummary}</p>
          </section>

          <section className="mt-4">
            {adminProductsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading products...</p>
            ) : adminProductsQuery.isError ? (
              <p className="text-sm text-destructive">
                {toStatusMessage(adminProductsQuery.error, 'Failed to load admin products')}
              </p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products found.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Title</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Slug</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Category</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Price</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Inventory</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Status</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Safety</th>
                      <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-200/80 last:border-b-0">
                        <td className="px-3 py-2">
                          <p className="font-medium">{product.title}</p>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{product.slug}</td>
                        <td className="px-3 py-2">{product.categoryName}</td>
                        <td className="px-3 py-2">{formatCurrency(product.priceCents)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Input
                              className="h-8 w-20 text-xs"
                              type="number"
                              min={0}
                              value={inventoryEdits[product.id] ?? String(product.inventoryQty)}
                              onChange={(event) =>
                                setInventoryEdits((prev) => ({
                                  ...prev,
                                  [product.id]: event.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const parsed = Number.parseInt(
                                  inventoryEdits[product.id] ?? String(product.inventoryQty),
                                  10,
                                )
                                if (Number.isNaN(parsed) || parsed < 0) {
                                  notifyError('Inventory must be a non-negative integer.')
                                  return
                                }
                                updateInventoryMutation.mutate({
                                  productId: product.id,
                                  quantity: parsed,
                                })
                              }}
                              disabled={updateInventoryMutation.isPending}
                            >
                              Save
                            </Button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ${
                              product.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-medium ${
                              product.isNsfw
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {product.isNsfw ? '18+' : 'General'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={product.isActive ? 'outline' : 'default'}
                              disabled={updateProductMutation.isPending}
                              onClick={() =>
                                updateProductMutation.mutate({
                                  productId: product.id,
                                  isActive: !product.isActive,
                                })
                              }
                            >
                              {product.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updateProductMutation.isPending}
                              onClick={() =>
                                updateProductMutation.mutate({
                                  productId: product.id,
                                  isNsfw: !product.isNsfw,
                                })
                              }
                            >
                              {product.isNsfw ? 'Mark General' : 'Mark 18+'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm">
            <p>
              Page {meta?.page ?? page} of {meta?.totalPages ?? 1} ({meta?.total ?? 0} products)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev || adminProductsQuery.isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!canGoNext || adminProductsQuery.isFetching}
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
