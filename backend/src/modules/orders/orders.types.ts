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
