import type { OrderStatus, PaymentStatus } from '@prisma/client'

export type OrderListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'total_desc'
  | 'total_asc'
  | 'status_asc'

export type CustomerOrderListQuery = {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  page: number
  limit: number
  sort: OrderListSort
}

export type AdminOrderListQuery = {
  userId?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  page: number
  limit: number
  sort: OrderListSort
}

export type OrderListItem = {
  id: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalCents: number
  createdAt: Date
}

export type OrderListResult = {
  data: OrderListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UpdateOrderStatusResult = {
  data: {
    orderId: string
    fromStatus: OrderStatus
    toStatus: OrderStatus
    note: string | null
    changedByUserId: string | null
    createdAt: Date
  }
}

export type OrderStatusTransitionHistoryResult = {
  data: Array<{
    id: string
    orderId: string
    fromStatus: OrderStatus
    toStatus: OrderStatus
    changedByUserId: string | null
    changedByEmail: string | null
    note: string | null
    createdAt: Date
  }>
}

export type CustomerOrderDetailResult = {
  data: {
    id: string
    userId: string
    status: OrderStatus
    paymentStatus: PaymentStatus
    subtotalCents: number
    discountCents: number
    shippingCents: number
    taxCents: number
    totalCents: number
    createdAt: Date
    updatedAt: Date
    address: {
      fullName: string
      line1: string
      line2: string | null
      city: string
      state: string
      postalCode: string
      country: string
    }
    items: Array<{
      id: string
      productId: string
      titleSnapshot: string
      unitPriceCents: number
      quantity: number
      lineTotalCents: number
    }>
    statusTransitions: Array<{
      id: string
      fromStatus: OrderStatus
      toStatus: OrderStatus
      note: string | null
      createdAt: Date
    }>
  }
}
