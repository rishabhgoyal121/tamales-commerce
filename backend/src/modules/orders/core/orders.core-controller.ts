import type { OrderStatus, PaymentStatus } from '@prisma/client'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  getCustomerOrderDetailById,
  getOrderStatusById,
  listAdminOrders,
  listCustomerOrders,
  listOrderStatusTransitions,
  updateOrderStatusWithTransition,
} from '../service/orders.service.js'
import type {
  AdminOrderListQuery,
  CustomerOrderDetailResult,
  CustomerOrderListQuery,
  OrderStatusTransitionHistoryResult,
  OrderListSort,
  UpdateOrderStatusResult,
} from '../orders.types.js'
import type { UpdateAdminOrderStatusInput } from '../schema/orders.schema.js'

const ORDER_STATUSES: readonly OrderStatus[] = [
  'CREATED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'PENDING',
  'AUTHORIZED',
  'FAILED',
  'REFUNDED',
]

const ORDER_SORTS: readonly OrderListSort[] = [
  'createdAt_desc',
  'createdAt_asc',
  'total_desc',
  'total_asc',
  'status_asc',
]

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

const CUSTOMER_ALLOWED_KEYS = new Set(['status', 'paymentStatus', 'page', 'limit', 'sort'])
const ADMIN_ALLOWED_KEYS = new Set([
  'userId',
  'status',
  'paymentStatus',
  'page',
  'limit',
  'sort',
])

function parsePageLimit(rawQuery: Record<string, unknown>) {
  const page = rawQuery.page ? Number.parseInt(String(rawQuery.page), 10) : 1
  if (Number.isNaN(page) || page < 1) {
    throw new AppError('VALIDATION_ERROR', 'page must be a positive integer', 422)
  }

  const parsedLimit = rawQuery.limit ? Number.parseInt(String(rawQuery.limit), 10) : 12
  if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
    throw new AppError('VALIDATION_ERROR', 'limit must be a positive integer', 422)
  }

  const limit = Math.min(parsedLimit, 48)
  return { page, limit }
}

function parseOrderStatus(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  const status = String(value)
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `status must be one of: ${ORDER_STATUSES.join(', ')}`,
      422,
    )
  }

  return status as OrderStatus
}

function parsePaymentStatus(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  const paymentStatus = String(value)
  if (!PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `paymentStatus must be one of: ${PAYMENT_STATUSES.join(', ')}`,
      422,
    )
  }

  return paymentStatus as PaymentStatus
}

function parseSort(value: unknown) {
  const sort = value ? String(value) : 'createdAt_desc'
  if (!ORDER_SORTS.includes(sort as OrderListSort)) {
    throw new AppError('VALIDATION_ERROR', `sort must be one of: ${ORDER_SORTS.join(', ')}`, 422)
  }

  return sort as OrderListSort
}

function assertAllowedKeys(rawQuery: Record<string, unknown>, allowed: Set<string>) {
  const unknownKeys = Object.keys(rawQuery).filter((key) => !allowed.has(key))
  if (unknownKeys.length > 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Unsupported query parameters: ${unknownKeys.join(', ')}`,
      422,
    )
  }
}

export function normalizeCustomerOrderListQuery(
  rawQuery: Record<string, unknown>,
): CustomerOrderListQuery {
  assertAllowedKeys(rawQuery, CUSTOMER_ALLOWED_KEYS)
  const { page, limit } = parsePageLimit(rawQuery)

  return {
    status: parseOrderStatus(rawQuery.status),
    paymentStatus: parsePaymentStatus(rawQuery.paymentStatus),
    page,
    limit,
    sort: parseSort(rawQuery.sort),
  }
}

export function normalizeAdminOrderListQuery(rawQuery: Record<string, unknown>): AdminOrderListQuery {
  assertAllowedKeys(rawQuery, ADMIN_ALLOWED_KEYS)
  const { page, limit } = parsePageLimit(rawQuery)

  return {
    userId: rawQuery.userId ? String(rawQuery.userId) : undefined,
    status: parseOrderStatus(rawQuery.status),
    paymentStatus: parsePaymentStatus(rawQuery.paymentStatus),
    page,
    limit,
    sort: parseSort(rawQuery.sort),
  }
}

export async function listCustomerOrdersCoreController(
  userId: string,
  rawQuery: Record<string, unknown>,
) {
  const query = normalizeCustomerOrderListQuery(rawQuery)
  return listCustomerOrders(userId, query)
}

export async function getCustomerOrderDetailCoreController(
  userId: string,
  orderId: string,
): Promise<CustomerOrderDetailResult> {
  const result = await getCustomerOrderDetailById(userId, orderId)

  if (!result) {
    throw new AppError('NOT_FOUND', 'Order not found', 404)
  }

  return result
}

export async function listAdminOrdersCoreController(rawQuery: Record<string, unknown>) {
  const query = normalizeAdminOrderListQuery(rawQuery)
  return listAdminOrders(query)
}

export function canTransitionOrderStatus(fromStatus: OrderStatus, toStatus: OrderStatus) {
  return ORDER_STATUS_TRANSITIONS[fromStatus].includes(toStatus)
}

export async function updateAdminOrderStatusCoreController(
  orderId: string,
  input: UpdateAdminOrderStatusInput,
  changedByUserId: string,
): Promise<UpdateOrderStatusResult> {
  const currentOrder = await getOrderStatusById(orderId)

  if (!currentOrder) {
    throw new AppError('NOT_FOUND', 'Order not found', 404)
  }

  if (currentOrder.status === input.status) {
    throw new AppError('VALIDATION_ERROR', `Order is already ${input.status}`, 422)
  }

  if (!canTransitionOrderStatus(currentOrder.status, input.status)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Invalid status transition: ${currentOrder.status} -> ${input.status}`,
      422,
    )
  }

  return updateOrderStatusWithTransition({
    orderId,
    fromStatus: currentOrder.status,
    toStatus: input.status,
    note: input.note,
    changedByUserId,
  })
}

export async function listAdminOrderStatusTransitionsCoreController(
  orderId: string,
): Promise<OrderStatusTransitionHistoryResult> {
  const currentOrder = await getOrderStatusById(orderId)
  if (!currentOrder) {
    throw new AppError('NOT_FOUND', 'Order not found', 404)
  }

  return listOrderStatusTransitions(orderId)
}
