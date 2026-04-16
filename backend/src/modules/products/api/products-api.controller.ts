import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  createAdminProductCoreController,
  getProductDetailCoreController,
  getProductDetailBySlugCoreController,
  listAdminCategoriesCoreController,
  listAdminProductsCoreController,
  listProductReviewsCoreController,
  listProductsCoreController,
  upsertProductReviewCoreController,
  updateAdminProductCoreController,
  updateAdminProductInventoryCoreController,
} from '../core/products.core-controller.js'
import {
  createAdminProductSchema,
  upsertProductReviewSchema,
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

function requireUserId(req: Request) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  return req.auth.userId
}

export async function listProductsApiController(req: Request, res: Response) {
  const result = await listProductsCoreController(req.query as Record<string, unknown>)
  res.json(result)
}

export async function getProductDetailApiController(req: Request, res: Response) {
  const productId = resolvePathParam(req, 'productId')
  const result = await getProductDetailCoreController(productId, req.query as Record<string, unknown>)
  res.json(result)
}

export async function getProductDetailBySlugApiController(req: Request, res: Response) {
  const slug = resolvePathParam(req, 'slug')
  const result = await getProductDetailBySlugCoreController(slug, req.query as Record<string, unknown>)
  res.json(result)
}

export async function listProductReviewsApiController(req: Request, res: Response) {
  const productId = resolvePathParam(req, 'productId')
  const result = await listProductReviewsCoreController(productId, req.query as Record<string, unknown>)
  res.json(result)
}

export async function upsertProductReviewApiController(req: Request, res: Response) {
  const userId = requireUserId(req)
  const productId = resolvePathParam(req, 'productId')
  const parsed = upsertProductReviewSchema.safeParse(req.body)

  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid review payload',
      422,
      parsed.error.flatten(),
    )
  }

  const result = await upsertProductReviewCoreController(productId, userId, parsed.data)
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
