import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  listAdminOrdersCoreController,
  listCustomerOrdersCoreController,
  updateAdminOrderStatusCoreController,
} from '../core/orders.core-controller.js'
import { updateAdminOrderStatusSchema } from '../schema/orders.schema.js'

export async function listMyOrdersApiController(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  const result = await listCustomerOrdersCoreController(
    req.auth.userId,
    req.query as Record<string, unknown>,
  )

  res.json(result)
}

export async function listAdminOrdersApiController(req: Request, res: Response) {
  const result = await listAdminOrdersCoreController(req.query as Record<string, unknown>)
  res.json(result)
}

export async function updateAdminOrderStatusApiController(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  const orderIdRaw = req.params.orderId
  const orderId = Array.isArray(orderIdRaw) ? orderIdRaw[0] : orderIdRaw

  if (!orderId) {
    throw new AppError('VALIDATION_ERROR', 'orderId path parameter is required', 422)
  }

  const parsed = updateAdminOrderStatusSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid update status payload',
      422,
      parsed.error.flatten(),
    )
  }

  const result = await updateAdminOrderStatusCoreController(orderId, parsed.data, req.auth.userId)
  res.json(result)
}
