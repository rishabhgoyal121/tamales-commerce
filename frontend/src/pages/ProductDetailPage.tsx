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

const productGalleryBySlug: Record<string, string[]> = {
  'wireless-headphones-pro': [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
  ],
  'mechanical-keyboard-lite': [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1400&q=80',
  ],
  'smart-desk-lamp': [
    'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80',
  ],
  'ceramic-coffee-mug-set': [
    'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1400&q=80',
  ],
  'yoga-mat-grip-plus': [
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
  ],
  'adjustable-dumbbells-20kg': [
    'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4f4?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1400&q=80',
  ],
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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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
  const productImages = product
    ? productGalleryBySlug[product.slug] ??
      [
        productImageBySlug[product.slug] ??
          'https://images.unsplash.com/photo-1515168833906-d2a3b82b302a?auto=format&fit=crop&w=1400&q=80',
      ]
    : []
  const activeImage = productImages[activeImageIndex] ?? productImages[0]
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

  const openGalleryAt = (index: number) => {
    setActiveImageIndex(index)
    setIsGalleryOpen(true)
  }

  const showPreviousImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  const showNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length)
  }

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
                  <button
                    type="button"
                    className="block w-full cursor-zoom-in"
                    onClick={() => openGalleryAt(activeImageIndex)}
                    aria-label="Open full-screen product gallery"
                  >
                    <SmartImage
                      src={activeImage}
                      alt={product.title}
                      className="h-[320px] w-full object-cover"
                    />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {productImages.map((imageUrl, index) => (
                    <button
                      key={`${product.slug}-thumb-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-md border ${
                        activeImageIndex === index ? 'border-slate-900' : 'border-slate-200'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <SmartImage
                        src={imageUrl}
                        alt={`${product.title} ${index + 1}`}
                        className="h-16 w-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Click image for almost full-screen carousel view.</p>
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
      {isGalleryOpen && product ? (
        <div className="fixed inset-0 z-50 bg-black/85">
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between p-4">
              <p className="truncate text-sm font-semibold text-white">{product.title}</p>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-xl text-white"
                onClick={() => setIsGalleryOpen(false)}
                aria-label="Close gallery"
              >
                ×
              </button>
            </div>

            <div className="relative flex-1 px-4 pb-4">
              <button
                type="button"
                className="absolute left-6 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-900"
                onClick={showPreviousImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <div className="mx-auto h-full max-h-[88vh] max-w-[94vw] overflow-hidden rounded-xl border border-white/20 bg-black/20">
                <SmartImage
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <button
                type="button"
                className="absolute right-6 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-900"
                onClick={showNextImage}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 pb-6">
              {productImages.map((imageUrl, index) => (
                <button
                  key={`${product.slug}-modal-${index}`}
                  type="button"
                  className={`overflow-hidden rounded-md border ${
                    activeImageIndex === index ? 'border-white' : 'border-white/40'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <SmartImage
                    src={imageUrl}
                    alt={`${product.title} preview ${index + 1}`}
                    className="h-14 w-14 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
