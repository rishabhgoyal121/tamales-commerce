import { prisma } from '../../../shared/prisma/client.js'
import type {
  AdminOrderListQuery,
  CustomerOrderListQuery,
  OrderListResult,
} from '../orders.types.js'

const SORT_TO_ORDER_BY: Record<
  CustomerOrderListQuery['sort'],
  { createdAt?: 'asc' | 'desc'; totalCents?: 'asc' | 'desc'; status?: 'asc' | 'desc' }
> = {
  createdAt_desc: { createdAt: 'desc' },
  createdAt_asc: { createdAt: 'asc' },
  total_desc: { totalCents: 'desc' },
  total_asc: { totalCents: 'asc' },
  status_asc: { status: 'asc' },
}

function toMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  }
}

export async function listCustomerOrders(
  userId: string,
  query: CustomerOrderListQuery,
): Promise<OrderListResult> {
  const where = {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
  }

  const skip = (query.page - 1) * query.limit

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: SORT_TO_ORDER_BY[query.sort],
      skip,
      take: query.limit,
      select: {
        id: true,
        userId: true,
        status: true,
        paymentStatus: true,
        totalCents: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    data: orders,
    meta: toMeta(total, query.page, query.limit),
  }
}

export async function listAdminOrders(query: AdminOrderListQuery): Promise<OrderListResult> {
  const where = {
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
  }

  const skip = (query.page - 1) * query.limit

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: SORT_TO_ORDER_BY[query.sort],
      skip,
      take: query.limit,
      select: {
        id: true,
        userId: true,
        status: true,
        paymentStatus: true,
        totalCents: true,
        createdAt: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    data: orders,
    meta: toMeta(total, query.page, query.limit),
  }
}
