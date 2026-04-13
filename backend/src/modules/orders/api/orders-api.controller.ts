import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  listAdminOrdersCoreController,
  listCustomerOrdersCoreController,
} from '../core/orders.core-controller.js'

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
