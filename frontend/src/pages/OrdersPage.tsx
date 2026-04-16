import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/seo/Seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { formatCurrency } from '@/lib/currency'
import {
  listMyOrders,
  type OrderListSort,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/auth-api'

const ORDER_STATUS_OPTIONS: Array<{ value: '' | OrderStatus; label: string }> = [
  { value: '', label: 'All order statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const PAYMENT_STATUS_OPTIONS: Array<{ value: '' | PaymentStatus; label: string }> = [
  { value: '', label: 'All payment statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'AUTHORIZED', label: 'Authorized' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
]

const SORT_OPTIONS: Array<{ value: OrderListSort; label: string }> = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'total_desc', label: 'Total: High to Low' },
  { value: 'total_asc', label: 'Total: Low to High' },
  { value: 'status_asc', label: 'Status: A to Z' },
]

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'SHIPPED':
      return 'bg-sky-50 text-sky-700 border-sky-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function paymentBadgeClass(status: PaymentStatus) {
  switch (status) {
    case 'AUTHORIZED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'REFUNDED':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

export function OrdersPage() {
  const { accessToken } = useAuthSession()

  const [status, setStatus] = useState<'' | OrderStatus>('')
  const [paymentStatus, setPaymentStatus] = useState<'' | PaymentStatus>('')
  const [sort, setSort] = useState<OrderListSort>('createdAt_desc')
  const [page, setPage] = useState(1)
  const limit = 12

  const ordersQuery = useQuery({
    queryKey: ['my-orders', { status, paymentStatus, sort, page, limit }],
    queryFn: () =>
      listMyOrders(accessToken, {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        sort,
        page,
        limit,
      }),
    enabled: !!accessToken,
  })

  const orders = ordersQuery.data?.data ?? []
  const meta = ordersQuery.data?.meta
  const canGoPrev = (meta?.page ?? page) > 1
  const canGoNext = meta ? meta.page < meta.totalPages : false

  return (
    <>
      <Seo title="My Orders | Tamales Commerce" description="Track order history, payment status, and delivery updates." />
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <section className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="orders-status">Order status</Label>
                <select
                  id="orders-status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as '' | OrderStatus)
                    setPage(1)
                  }}
                >
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orders-payment-status">Payment status</Label>
                <select
                  id="orders-payment-status"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={paymentStatus}
                  onChange={(event) => {
                    setPaymentStatus(event.target.value as '' | PaymentStatus)
                    setPage(1)
                  }}
                >
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orders-sort">Sort</Label>
                <select
                  id="orders-sort"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as OrderListSort)
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
          </section>

          <section className="mt-4">
            {ordersQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading orders...</p> : null}

            {ordersQuery.isError ? (
              <p className="text-sm text-destructive">{toStatusMessage(ordersQuery.error, 'Failed to load orders')}</p>
            ) : null}

            {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders found for selected filters.</p>
            ) : null}

            {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm">{order.id}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(order.totalCents)}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${paymentBadgeClass(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <Link
                        to={`/orders/${order.id}`}
                        className="ml-auto inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium hover:bg-slate-50"
                      >
                        View details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm">
            <p>
              Page {meta?.page ?? page} of {meta?.totalPages ?? 1} ({meta?.total ?? 0} orders)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!canGoPrev || ordersQuery.isFetching}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!canGoNext || ordersQuery.isFetching}
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
