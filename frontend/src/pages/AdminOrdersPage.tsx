import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toStatusMessage } from '@/lib/api-error'
import { formatCurrency } from '@/lib/currency'
import {
  listAdminOrders,
  updateAdminOrderStatus,
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

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const { accessToken, setStatusMessage } = useAuthSession()

  const [userIdInput, setUserIdInput] = useState('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<'' | OrderStatus>('')
  const [paymentStatus, setPaymentStatus] = useState<'' | PaymentStatus>('')
  const [sort, setSort] = useState<OrderListSort>('createdAt_desc')
  const [page, setPage] = useState(1)
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, OrderStatus>>({})
  const [notesByOrder, setNotesByOrder] = useState<Record<string, string>>({})

  const limit = 12

  const adminOrdersQuery = useQuery({
    queryKey: ['admin-orders', { userId, status, paymentStatus, sort, page, limit }],
    queryFn: () =>
      listAdminOrders(accessToken, {
        userId: userId || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        sort,
        page,
        limit,
      }),
    enabled: !!accessToken,
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: (payload: { orderId: string; status: OrderStatus; note?: string }) =>
      updateAdminOrderStatus(accessToken, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      setStatusMessage(
        `Order ${response.data.orderId} moved ${response.data.fromStatus} -> ${response.data.toStatus}.`,
      )
    },
    onError: (error) => {
      setStatusMessage(toStatusMessage(error, 'Failed to update order status'))
    },
  })

  const orders = adminOrdersQuery.data?.data ?? []
  const meta = adminOrdersQuery.data?.meta
  const canGoPrev = (meta?.page ?? page) > 1
  const canGoNext = meta ? meta.page < meta.totalPages : false

  const getSelectedStatus = (orderId: string, fallback: OrderStatus) => {
    return selectedStatuses[orderId] ?? fallback
  }

  const getAllowedNextStatuses = (currentStatus: OrderStatus) => {
    return ORDER_STATUS_TRANSITIONS[currentStatus]
  }

  const handleUpdateStatus = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = getSelectedStatus(orderId, currentStatus)
    if (nextStatus === currentStatus) {
      setStatusMessage('Choose a new status before updating.')
      return
    }

    updateOrderStatusMutation.mutate({
      orderId,
      status: nextStatus,
      note: notesByOrder[orderId],
    })
  }

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Admin Orders</CardTitle>
        <CardDescription>Manage and inspect all customer orders across statuses.</CardDescription>
      </CardHeader>
      <CardContent>
        <section className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="admin-orders-user-id">Filter by User ID</Label>
              <Input
                id="admin-orders-user-id"
                value={userIdInput}
                onChange={(event) => setUserIdInput(event.target.value)}
                placeholder="Optional userId"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-orders-status">Order status</Label>
              <select
                id="admin-orders-status"
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
              <Label htmlFor="admin-orders-payment-status">Payment status</Label>
              <select
                id="admin-orders-payment-status"
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
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="admin-orders-sort">Sort</Label>
              <select
                id="admin-orders-sort"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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
            <Button
              onClick={() => {
                setUserId(userIdInput.trim())
                setPage(1)
              }}
            >
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setUserIdInput('')
                setUserId('')
                setStatus('')
                setPaymentStatus('')
                setSort('createdAt_desc')
                setPage(1)
              }}
            >
              Reset
            </Button>
          </div>
        </section>

        <section className="mt-4">
          {adminOrdersQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading admin orders...</p> : null}

          {adminOrdersQuery.isError ? (
            <p className="text-sm text-destructive">
              {toStatusMessage(adminOrdersQuery.error, 'Failed to load admin orders')}
            </p>
          ) : null}

          {!adminOrdersQuery.isLoading && !adminOrdersQuery.isError && orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found for selected filters.</p>
          ) : null}

          {!adminOrdersQuery.isLoading && !adminOrdersQuery.isError && orders.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Order ID</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">User ID</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Current Status</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Payment</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Total</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Created</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Next Status</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Note</th>
                    <th className="border-b border-slate-200/80 px-3 py-2 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const allowedStatuses = getAllowedNextStatuses(order.status)
                    const selectedStatus = getSelectedStatus(order.id, order.status)

                    return (
                      <tr key={order.id} className="border-b border-slate-200/80 last:border-b-0">
                        <td className="px-3 py-2 font-mono text-xs">{order.id}</td>
                        <td className="px-3 py-2 font-mono text-xs">{order.userId}</td>
                        <td className="px-3 py-2">{order.status}</td>
                        <td className="px-3 py-2">{order.paymentStatus}</td>
                        <td className="px-3 py-2">{formatCurrency(order.totalCents)}</td>
                        <td className="px-3 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            value={selectedStatus}
                            onChange={(event) => {
                              setSelectedStatuses((previous) => ({
                                ...previous,
                                [order.id]: event.target.value as OrderStatus,
                              }))
                            }}
                            disabled={allowedStatuses.length === 0}
                          >
                            <option value={order.status}>{order.status}</option>
                            {allowedStatuses.map((statusOption) => (
                              <option key={statusOption} value={statusOption}>
                                {statusOption}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-8 min-w-40 text-xs"
                            placeholder="Optional note"
                            value={notesByOrder[order.id] ?? ''}
                            onChange={(event) => {
                              setNotesByOrder((previous) => ({
                                ...previous,
                                [order.id]: event.target.value,
                              }))
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, order.status)}
                            disabled={
                              allowedStatuses.length === 0 ||
                              selectedStatus === order.status ||
                              updateOrderStatusMutation.isPending
                            }
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
              disabled={!canGoPrev || adminOrdersQuery.isFetching}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!canGoNext || adminOrdersQuery.isFetching}
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
