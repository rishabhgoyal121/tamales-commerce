import { useEffect, useState } from 'react'
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
import {
  addCartItem,
  getCart,
  getProductDetail,
  getProductDetailBySlug,
  listProductReviews,
  upsertProductReview,
} from '@/lib/auth-api'
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

function formatReviewSummary(average: number, count: number) {
  if (count <= 0) {
    return 'No ratings yet'
  }

  return `⭐ ${average.toFixed(1)} · ${count} review${count === 1 ? '' : 's'}`
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function ProductDetailPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { productId, slug } = useParams<{ productId: string; slug: string }>()
  const { user, isAuthenticated, accessToken, setStatusMessage } = useAuthSession()
  const [quantity, setQuantity] = useState(1)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')

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
  const product = detailQuery.data?.data

  const cartQuery = useQuery({
    queryKey: ['cart', accessToken],
    queryFn: () => getCart(accessToken),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 15_000,
  })

  const reviewsQuery = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () =>
      listProductReviews(product?.id ?? '', {
        page: 1,
        limit: 20,
        sort: 'createdAt_desc',
      }),
    enabled: !!product?.id,
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

  const upsertReviewMutation = useMutation({
    mutationFn: (payload: { productId: string; rating: number; title?: string; comment?: string }) =>
      upsertProductReview(accessToken, payload.productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] })
      queryClient.invalidateQueries({ queryKey: ['product-detail', { productId, slug }] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setStatusMessage('Review submitted successfully.')
      notifyInfo('Review submitted successfully.')
    },
    onError: (error) => {
      const message = toStatusMessage(error, 'Failed to submit review')
      setStatusMessage(message)
      notifyError(message)
    },
  })

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
  const reviews = reviewsQuery.data?.data ?? []
  const myExistingReview = user ? reviews.find((review) => review.userId === user.id) : null

  useEffect(() => {
    if (myExistingReview) {
      setReviewRating(myExistingReview.rating)
      setReviewTitle(myExistingReview.title ?? '')
      setReviewComment(myExistingReview.comment ?? '')
      return
    }

    setReviewRating(5)
    setReviewTitle('')
    setReviewComment('')
  }, [myExistingReview?.id])

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

  const handleSubmitReview = async () => {
    if (!product) {
      return
    }

    if (!isAuthenticated) {
      const message = 'Please login to write a review.'
      setStatusMessage(message)
      notifyInfo(message)
      navigate(`/login?next=${encodeURIComponent(`/products/${product.id}`)}`)
      return
    }

    const normalizedTitle = reviewTitle.trim()
    const normalizedComment = reviewComment.trim()

    if (normalizedTitle && normalizedTitle.length < 2) {
      const message = 'Review title must be at least 2 characters.'
      setStatusMessage(message)
      notifyError(message)
      return
    }

    if (normalizedComment && normalizedComment.length < 4) {
      const message = 'Review comment must be at least 4 characters.'
      setStatusMessage(message)
      notifyError(message)
      return
    }

    await upsertReviewMutation.mutateAsync({
      productId: product.id,
      rating: reviewRating,
      title: normalizedTitle || undefined,
      comment: normalizedComment || undefined,
    })
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
            <div className="space-y-6">
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
                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      {formatReviewSummary(product.ratingAverage, product.ratingCount)}
                    </p>
                  </div>

                  {product.ratingCount > 0 ? (
                    <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3">
                      <p className="text-xs font-semibold text-amber-800">Rating Breakdown</p>
                      <div className="mt-2 space-y-1.5">
                        {(['5', '4', '3', '2', '1'] as const).map((key) => {
                          const count = product.ratingBreakdown[key]
                          const width = product.ratingCount > 0 ? Math.round((count / product.ratingCount) * 100) : 0
                          return (
                            <div key={key} className="grid grid-cols-[28px_1fr_28px] items-center gap-2 text-xs text-amber-900">
                              <span>{key}★</span>
                              <div className="h-1.5 rounded-full bg-amber-100">
                                <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${width}%` }} />
                              </div>
                              <span className="text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}

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

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Customer Reviews</h3>
                    <p className="text-sm text-slate-600">{formatReviewSummary(product.ratingAverage, product.ratingCount)}</p>
                  </div>
                </div>

                <div className="mb-5 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {myExistingReview ? 'Update your review' : 'Write a review'}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="review-rating">Rating</Label>
                      <select
                        id="review-rating"
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={reviewRating}
                        onChange={(event) => setReviewRating(Number.parseInt(event.target.value, 10))}
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - Average</option>
                        <option value={2}>2 - Poor</option>
                        <option value={1}>1 - Bad</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-title">Title (optional)</Label>
                      <Input
                        id="review-title"
                        value={reviewTitle}
                        onChange={(event) => setReviewTitle(event.target.value)}
                        placeholder="Great value and quality"
                        maxLength={120}
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="review-comment">Comment (optional)</Label>
                    <textarea
                      id="review-comment"
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      maxLength={2000}
                      placeholder="Share what you liked or disliked"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      onClick={() => void handleSubmitReview()}
                      disabled={upsertReviewMutation.isPending}
                    >
                      {upsertReviewMutation.isPending
                        ? 'Saving...'
                        : myExistingReview
                          ? 'Update Review'
                          : 'Submit Review'}
                    </Button>
                    {!isAuthenticated ? (
                      <p className="text-xs text-slate-500">Login required to submit a review.</p>
                    ) : null}
                  </div>
                </div>

                {reviewsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading reviews...</p>
                ) : reviewsQuery.isError ? (
                  <p className="text-sm text-destructive">
                    {toStatusMessage(reviewsQuery.error, 'Failed to load reviews')}
                  </p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-slate-600">No reviews yet. Be the first to review this product.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <article key={review.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {'★'.repeat(review.rating)}
                            <span className="text-slate-400">{'★'.repeat(5 - review.rating)}</span>
                          </p>
                          <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {review.title || 'Untitled review'}
                        </p>
                        {review.comment ? (
                          <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-500">{review.userEmail}</p>
                      </article>
                    ))}
                  </div>
                )}
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
