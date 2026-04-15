import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  createAdminProductCoreController,
  getProductDetailCoreController,
  listAdminCategoriesCoreController,
  listAdminProductsCoreController,
  listProductsCoreController,
  updateAdminProductCoreController,
  updateAdminProductInventoryCoreController,
} from '../core/products.core-controller.js'
import {
  createAdminProductSchema,
  updateAdminProductInventorySchema,
  updateAdminProductSchema,
} from '../schema/products.schema.js'

function resolvePathParam(req: Request, name: string) {
  const value = req.params[name]
  const resolved = Array.isArray(value) ? value[0] : value
  if (!resolved) {
    throw new AppError('VALIDATION_ERROR', `${name} path parameter is required`, 422)
  }

  return resolved
}

export async function listProductsApiController(req: Request, res: Response) {
  const result = await listProductsCoreController(req.query as Record<string, unknown>)
  res.json(result)
}

export async function getProductDetailApiController(req: Request, res: Response) {
  const productId = resolvePathParam(req, 'productId')
  const result = await getProductDetailCoreController(productId)
  res.json(result)
}

export async function listAdminProductsApiController(req: Request, res: Response) {
  const result = await listAdminProductsCoreController(req.query as Record<string, unknown>)
  res.json(result)
}

export async function listAdminCategoriesApiController(_req: Request, res: Response) {
  const result = await listAdminCategoriesCoreController()
  res.json(result)
}

export async function createAdminProductApiController(req: Request, res: Response) {
  const parsed = createAdminProductSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid create product payload',
      422,
      parsed.error.flatten(),
    )
  }

  const result = await createAdminProductCoreController(parsed.data)
  res.status(201).json(result)
}

export async function updateAdminProductApiController(req: Request, res: Response) {
  const productId = resolvePathParam(req, 'productId')
  const parsed = updateAdminProductSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid update product payload',
      422,
      parsed.error.flatten(),
    )
  }

  const result = await updateAdminProductCoreController(productId, parsed.data)
  res.json(result)
}

export async function updateAdminProductInventoryApiController(req: Request, res: Response) {
  const productId = resolvePathParam(req, 'productId')
  const parsed = updateAdminProductInventorySchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid update inventory payload',
      422,
      parsed.error.flatten(),
    )
  }

  const result = await updateAdminProductInventoryCoreController(productId, parsed.data)
  res.json(result)
}
