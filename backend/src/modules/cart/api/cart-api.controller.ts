import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import { addCartItemSchema, updateCartItemSchema } from '../schema/cart.schema.js'
import {
  addCartItemCoreController,
  clearCartCoreController,
  getCartCoreController,
  removeCartItemCoreController,
  updateCartItemCoreController,
} from '../core/cart.core-controller.js'

function requireUserId(req: Request) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  return req.auth.userId
}

function requirePathParam(value: string | string[] | undefined, name: string) {
  const resolved = Array.isArray(value) ? value[0] : value
  if (!resolved) {
    throw new AppError('VALIDATION_ERROR', `Missing path parameter: ${name}`, 422)
  }

  return resolved
}

export async function getCartApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const cart = await getCartCoreController(userId)
  res.json({ data: cart })
}

export async function addCartItemApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const parsed = addCartItemSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid add cart payload', 422, parsed.error.flatten())
  }

  const cart = await addCartItemCoreController(userId, parsed.data.productId, parsed.data.quantity)
  res.status(201).json({ data: cart })
}

export async function updateCartItemApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const itemId = requirePathParam(req.params.itemId, 'itemId')
  const parsed = updateCartItemSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid cart update payload', 422, parsed.error.flatten())
  }

  const cart = await updateCartItemCoreController(userId, itemId, parsed.data.quantity)
  res.json({ data: cart })
}

export async function removeCartItemApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const itemId = requirePathParam(req.params.itemId, 'itemId')
  const cart = await removeCartItemCoreController(userId, itemId)
  res.json({ data: cart })
}

export async function clearCartApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const cart = await clearCartCoreController(userId)
  res.json({ data: cart })
}
