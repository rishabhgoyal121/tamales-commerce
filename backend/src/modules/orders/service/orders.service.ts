import { prisma } from '../../../shared/prisma/client.js'
import { AppError } from '../../../shared/errors/app-error.js'
import type {
  AdminOrderListQuery,
  CustomerOrderDetailResult,
  CustomerOrderListQuery,
  OrderStatusTransitionHistoryResult,
  OrderListResult,
  UpdateOrderStatusResult,
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

export async function getOrderStatusById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
    },
  })
}

export async function updateOrderStatusWithTransition(args: {
  orderId: string
  fromStatus: 'CREATED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  toStatus: 'CREATED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  changedByUserId: string
  note?: string
}): Promise<UpdateOrderStatusResult> {
  const note = args.note?.trim() || null

  const transition = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: args.orderId },
      select: { id: true, status: true },
    })

    if (!order) {
      throw new AppError('NOT_FOUND', 'Order not found', 404)
    }

    if (order.status !== args.fromStatus) {
      throw new AppError(
        'CONFLICT',
        `Order status changed concurrently (expected ${args.fromStatus}, found ${order.status})`,
        409,
      )
    }

    await tx.order.update({
      where: { id: args.orderId },
      data: { status: args.toStatus },
    })

    return tx.orderStatusTransition.create({
      data: {
        orderId: args.orderId,
        fromStatus: args.fromStatus,
        toStatus: args.toStatus,
        changedByUserId: args.changedByUserId,
        note,
      },
      select: {
        orderId: true,
        fromStatus: true,
        toStatus: true,
        changedByUserId: true,
        note: true,
        createdAt: true,
      },
    })
  })

  return { data: transition }
}

export async function listOrderStatusTransitions(
  orderId: string,
): Promise<OrderStatusTransitionHistoryResult> {
  const transitions = await prisma.orderStatusTransition.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderId: true,
      fromStatus: true,
      toStatus: true,
      changedByUserId: true,
      note: true,
      createdAt: true,
      changedByUser: {
        select: {
          email: true,
        },
      },
    },
  })

  return {
    data: transitions.map((transition) => ({
      id: transition.id,
      orderId: transition.orderId,
      fromStatus: transition.fromStatus,
      toStatus: transition.toStatus,
      changedByUserId: transition.changedByUserId,
      changedByEmail: transition.changedByUser?.email ?? null,
      note: transition.note,
      createdAt: transition.createdAt,
    })),
  }
}

export async function getCustomerOrderDetailById(
  userId: string,
  orderId: string,
): Promise<CustomerOrderDetailResult | null> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      status: true,
      paymentStatus: true,
      subtotalCents: true,
      discountCents: true,
      shippingCents: true,
      taxCents: true,
      totalCents: true,
      createdAt: true,
      updatedAt: true,
      address: {
        select: {
          fullName: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          titleSnapshot: true,
          unitPriceCents: true,
          quantity: true,
        },
      },
      statusTransitions: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          note: true,
          createdAt: true,
        },
      },
    },
  })

  if (!order) {
    return null
  }

  return {
    data: {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        lineTotalCents: item.unitPriceCents * item.quantity,
      })),
    },
  }
}
