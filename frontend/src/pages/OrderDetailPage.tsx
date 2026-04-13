import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { formatCurrency } from '@/lib/currency'
import { getMyOrderDetail } from '@/lib/auth-api'

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { accessToken } = useAuthSession()

  const orderDetailQuery = useQuery({
    queryKey: ['my-order-detail', orderId],
    queryFn: () => getMyOrderDetail(accessToken, orderId ?? ''),
    enabled: !!accessToken && !!orderId,
  })

  const detail = orderDetailQuery.data?.data

  return (
    <>
      <Seo title="Order Detail | Tamales Commerce" description="Inspect order items, pricing, address, and status timeline." />
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Order Detail</CardTitle>
          <CardDescription>View items, pricing breakdown, address, and status timeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Link
              to="/orders"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Back to My Orders
            </Link>
          </div>

          {orderDetailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading order detail...</p>
          ) : orderDetailQuery.isError ? (
            <p className="text-sm text-destructive">{toStatusMessage(orderDetailQuery.error, 'Failed to load order detail')}</p>
          ) : !detail ? (
            <p className="text-sm text-muted-foreground">Order not found.</p>
          ) : (
            <div className="space-y-4">
              <section className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{detail.id}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(detail.totalCents)}</p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Status: {detail.status}</p>
                  <p>Payment: {detail.paymentStatus}</p>
                  <p>Created: {new Date(detail.createdAt).toLocaleString()}</p>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200/80 bg-white p-4">
                <h3 className="text-sm font-semibold">Items</h3>
                <div className="mt-3 space-y-2">
                  {detail.items.map((item) => (
                    <article key={item.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                      <p className="font-medium">{item.titleSnapshot}</p>
                      <p className="text-xs text-muted-foreground">Product ID: {item.productId}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPriceCents)} = {formatCurrency(item.lineTotalCents)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200/80 bg-white p-4">
                <h3 className="text-sm font-semibold">Pricing</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Subtotal: {formatCurrency(detail.subtotalCents)}</p>
                  <p>Discount: -{formatCurrency(detail.discountCents)}</p>
                  <p>Shipping: {formatCurrency(detail.shippingCents)}</p>
                  <p>Tax: {formatCurrency(detail.taxCents)}</p>
                  <p className="font-semibold">Total: {formatCurrency(detail.totalCents)}</p>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200/80 bg-white p-4">
                <h3 className="text-sm font-semibold">Shipping Address</h3>
                <div className="mt-2 text-sm text-slate-700">
                  <p>{detail.address.fullName}</p>
                  <p>{detail.address.line1}</p>
                  {detail.address.line2 ? <p>{detail.address.line2}</p> : null}
                  <p>
                    {detail.address.city}, {detail.address.state} {detail.address.postalCode}
                  </p>
                  <p>{detail.address.country}</p>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200/80 bg-white p-4">
                <h3 className="text-sm font-semibold">Status Timeline</h3>
                {detail.statusTransitions.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No transitions recorded yet.</p>
                ) : (
                  <ol className="mt-2 space-y-2">
                    {detail.statusTransitions.map((transition) => (
                      <li key={transition.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                        <p className="font-medium">
                          {transition.fromStatus} {'->'} {transition.toStatus}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transition.createdAt).toLocaleString()}
                        </p>
                        {transition.note ? <p className="text-xs text-slate-700">Note: {transition.note}</p> : null}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
