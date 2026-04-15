import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SmartImage } from '@/components/common/SmartImage'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { addCartItem, getCart, getProductDetail, getProductDetailBySlug } from '@/lib/auth-api'
import { formatCurrency } from '@/lib/currency'
import { notifyError, notifyInfo, notifySuccessWithAction } from '@/lib/notify'

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

function stockLabel(quantity: number) {
  if (quantity <= 0) return { text: 'Out of stock', className: 'bg-rose-100 text-rose-700' }
  if (quantity <= 5) return { text: `Low stock (${quantity} left)`, className: 'bg-amber-100 text-amber-700' }
  return { text: 'In stock', className: 'bg-emerald-100 text-emerald-700' }
}

export function ProductDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { productId, slug } = useParams<{ productId: string; slug: string }>()
  const { isAuthenticated, accessToken, setStatusMessage } = useAuthSession()
  const [quantity, setQuantity] = useState(1)

  const detailQuery = useQuery({
    queryKey: ['product-detail', { productId, slug }],
    queryFn: () => {
      if (slug) {
        return getProductDetailBySlug(slug)
      }
      return getProductDetail(productId ?? '')
    },
    enabled: !!productId || !!slug,
  })

  const cartQuery = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: () => getCart(accessToken),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 15_000,
  })

  const addToCartMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number }) =>
      addCartItem(accessToken, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', accessToken], data)
      setStatusMessage('Added item to cart.')
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

  const product = detailQuery.data?.data
  const cartItems = cartQuery.data?.data.items ?? []
  const isInCart = product ? cartItems.some((item) => item.productId === product.id) : false
  const selectedQty = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity
  const stock = product ? stockLabel(product.inventoryQty) : null

  const addCurrentProductToCart = async () => {
    if (!product) {
      return false
    }

    if (!isAuthenticated) {
      const message = 'Please login to add this product to cart.'
      setStatusMessage(message)
      notifyInfo(message)
      navigate(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`)
      return false
    }

    if (product.inventoryQty <= 0) {
      const message = 'This product is currently out of stock.'
      setStatusMessage(message)
      notifyInfo(message)
      return false
    }

    if (selectedQty > product.inventoryQty) {
      const message = `Only ${product.inventoryQty} item(s) available in stock.`
      setStatusMessage(message)
      notifyInfo(message)
      return false
    }

    try {
      await addToCartMutation.mutateAsync({ productId: product.id, quantity: selectedQty })
      return true
    } catch {
      return false
    }
  }

  const handleAddToCart = () => {
    void addCurrentProductToCart()
  }

  const handleBuyNow = async () => {
    const added = await addCurrentProductToCart()
    if (added) {
      navigate('/checkout-preview')
    }
  }

  const seoTitle = product ? `${product.title} | Tamales Commerce` : 'Product Detail | Tamales Commerce'
  const seoDescription = product
    ? `${product.title} in ${product.categoryName}. Price ${formatCurrency(product.priceCents)}.`
    : 'Browse product details and purchase options.'

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />
      <Card className="animate-fade-up border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Product Detail</CardTitle>
          <CardDescription>Review product details, quantity, stock, and purchase actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Link
              to="/products"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Back to Products
            </Link>
          </div>

          {detailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          ) : detailQuery.isError ? (
            <p className="text-sm text-destructive">
              {toStatusMessage(detailQuery.error, 'Failed to load product detail')}
            </p>
          ) : !product ? (
            <p className="text-sm text-muted-foreground">Product not found.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <SmartImage
                    src={
                      productImageBySlug[product.slug] ??
                      'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={product.title}
                    className="h-[320px] w-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">SKU slug: {product.slug}</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-sm font-semibold text-slate-900">Description</p>
                  <p className="mt-1 text-sm text-slate-700">{product.description}</p>
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{product.categoryName}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{product.title}</h2>
                  <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(product.priceCents)}</p>
                </div>

                {stock ? (
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${stock.className}`}>
                    {stock.text}
                  </span>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="detail-quantity">Quantity</Label>
                  <Input
                    id="detail-quantity"
                    type="number"
                    min={1}
                    max={Math.max(1, product.inventoryQty)}
                    value={quantity}
                    onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10) || 1)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isInCart ? 'default' : 'outline'}
                    onClick={() => {
                      if (isInCart) {
                        navigate('/cart')
                        return
                      }
                      handleAddToCart()
                    }}
                    disabled={addToCartMutation.isPending || product.inventoryQty <= 0}
                  >
                    {isInCart ? 'Go to Cart' : 'Add to Cart'}
                  </Button>
                  <Button
                    className="animate-pulse-soft"
                    onClick={() => void handleBuyNow()}
                    disabled={addToCartMutation.isPending || product.inventoryQty <= 0}
                  >
                    Buy Now
                  </Button>
                </div>
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
