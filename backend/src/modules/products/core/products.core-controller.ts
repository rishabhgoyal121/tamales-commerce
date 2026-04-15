import { AppError } from '../../../shared/errors/app-error.js'
import type {
  AdminProductListQuery,
  AdminProductListSort,
  CreateAdminProductInput,
  ProductListQuery,
  ProductListSort,
  UpdateAdminProductInput,
  UpdateAdminProductInventoryInput,
} from '../products.types.js'
import {
  createAdminProduct,
  getPublicProductDetailById,
  getCategoryById,
  getProductById,
  getProductBySlug,
  listAdminCategoryOptions,
  listAdminProducts,
  listProducts,
  updateAdminProduct,
  updateAdminProductInventory,
} from '../service/product.service.js'

const ALLOWED_QUERY_KEYS = new Set([
  'q',
  'categoryId',
  'minPrice',
  'maxPrice',
  'page',
  'limit',
  'sort',
])

const ALLOWED_ADMIN_QUERY_KEYS = new Set(['q', 'categoryId', 'isActive', 'page', 'limit', 'sort'])

const ALLOWED_SORTS: readonly ProductListSort[] = [
  'createdAt_desc',
  'createdAt_asc',
  'price_asc',
  'price_desc',
  'title_asc',
]

const ALLOWED_ADMIN_SORTS: readonly AdminProductListSort[] = [
  'createdAt_desc',
  'createdAt_asc',
  'price_asc',
  'price_desc',
  'title_asc',
  'updatedAt_desc',
]

function parseOptionalInt(value: unknown, key: string) {
  if (value === undefined) {
    return undefined
  }

  const parsed = Number.parseInt(String(value), 10)
  if (Number.isNaN(parsed)) {
    throw new AppError('VALIDATION_ERROR', `Invalid ${key} value`, 422)
  }

  return parsed
}

function parseOptionalBoolean(value: unknown, key: string) {
  if (value === undefined) {
    return undefined
  }

  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'true') {
    return true
  }
  if (normalized === 'false') {
    return false
  }

  throw new AppError('VALIDATION_ERROR', `${key} must be true or false`, 422)
}

async function assertCategoryExists(categoryId: string) {
  const category = await getCategoryById(categoryId)
  if (!category) {
    throw new AppError('NOT_FOUND', 'Category not found', 404)
  }
}

export function normalizeProductListQuery(rawQuery: Record<string, unknown>): ProductListQuery {
  const unknownKeys = Object.keys(rawQuery).filter((key) => !ALLOWED_QUERY_KEYS.has(key))
  if (unknownKeys.length > 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Unsupported query parameters: ${unknownKeys.join(', ')}`,
      422,
    )
  }

  const q = rawQuery.q ? String(rawQuery.q).trim() : undefined
  const categoryId = rawQuery.categoryId ? String(rawQuery.categoryId) : undefined
  const minPrice = parseOptionalInt(rawQuery.minPrice, 'minPrice')
  const maxPrice = parseOptionalInt(rawQuery.maxPrice, 'maxPrice')

  if (minPrice !== undefined && minPrice < 0) {
    throw new AppError('VALIDATION_ERROR', 'minPrice cannot be negative', 422)
  }

  if (maxPrice !== undefined && maxPrice < 0) {
    throw new AppError('VALIDATION_ERROR', 'maxPrice cannot be negative', 422)
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new AppError('VALIDATION_ERROR', 'minPrice cannot exceed maxPrice', 422)
  }

  const parsedPage = rawQuery.page ? Number.parseInt(String(rawQuery.page), 10) : 1
  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    throw new AppError('VALIDATION_ERROR', 'page must be a positive integer', 422)
  }

  const parsedLimit = rawQuery.limit ? Number.parseInt(String(rawQuery.limit), 10) : 12
  if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
    throw new AppError('VALIDATION_ERROR', 'limit must be a positive integer', 422)
  }

  const limit = Math.min(parsedLimit, 48)
  const sort = rawQuery.sort ? String(rawQuery.sort) : 'createdAt_desc'

  if (!ALLOWED_SORTS.includes(sort as ProductListSort)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `sort must be one of: ${ALLOWED_SORTS.join(', ')}`,
      422,
    )
  }

  return {
    q: q || undefined,
    categoryId,
    minPrice,
    maxPrice,
    page: parsedPage,
    limit,
    sort: sort as ProductListSort,
  }
}

export function normalizeAdminProductListQuery(rawQuery: Record<string, unknown>): AdminProductListQuery {
  const unknownKeys = Object.keys(rawQuery).filter((key) => !ALLOWED_ADMIN_QUERY_KEYS.has(key))
  if (unknownKeys.length > 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Unsupported query parameters: ${unknownKeys.join(', ')}`,
      422,
    )
  }

  const q = rawQuery.q ? String(rawQuery.q).trim() : undefined
  const categoryId = rawQuery.categoryId ? String(rawQuery.categoryId) : undefined
  const isActive = parseOptionalBoolean(rawQuery.isActive, 'isActive')
  const parsedPage = rawQuery.page ? Number.parseInt(String(rawQuery.page), 10) : 1
  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    throw new AppError('VALIDATION_ERROR', 'page must be a positive integer', 422)
  }

  const parsedLimit = rawQuery.limit ? Number.parseInt(String(rawQuery.limit), 10) : 12
  if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
    throw new AppError('VALIDATION_ERROR', 'limit must be a positive integer', 422)
  }

  const limit = Math.min(parsedLimit, 48)
  const sort = rawQuery.sort ? String(rawQuery.sort) : 'updatedAt_desc'
  if (!ALLOWED_ADMIN_SORTS.includes(sort as AdminProductListSort)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `sort must be one of: ${ALLOWED_ADMIN_SORTS.join(', ')}`,
      422,
    )
  }

  return {
    q: q || undefined,
    categoryId,
    isActive,
    page: parsedPage,
    limit,
    sort: sort as AdminProductListSort,
  }
}

export async function listProductsCoreController(rawQuery: Record<string, unknown>) {
  const query = normalizeProductListQuery(rawQuery)
  return listProducts(query)
}

export async function getProductDetailCoreController(productId: string) {
  if (!productId.trim()) {
    throw new AppError('VALIDATION_ERROR', 'productId path parameter is required', 422)
  }

  const product = await getPublicProductDetailById(productId)
  if (!product) {
    throw new AppError('NOT_FOUND', 'Product not found', 404)
  }

  return product
}

export async function listAdminProductsCoreController(rawQuery: Record<string, unknown>) {
  const query = normalizeAdminProductListQuery(rawQuery)
  return listAdminProducts(query)
}

export async function listAdminCategoriesCoreController() {
  return { data: await listAdminCategoryOptions() }
}

export async function createAdminProductCoreController(input: CreateAdminProductInput) {
  await assertCategoryExists(input.categoryId)

  const existing = await getProductBySlug(input.slug)
  if (existing) {
    throw new AppError('CONFLICT', 'Product slug already exists', 409)
  }

  return createAdminProduct(input)
}

export async function updateAdminProductCoreController(
  productId: string,
  input: UpdateAdminProductInput,
) {
  const product = await getProductById(productId)
  if (!product) {
    throw new AppError('NOT_FOUND', 'Product not found', 404)
  }

  if (input.categoryId) {
    await assertCategoryExists(input.categoryId)
  }

  return updateAdminProduct(productId, input)
}

export async function updateAdminProductInventoryCoreController(
  productId: string,
  input: UpdateAdminProductInventoryInput,
) {
  const product = await getProductById(productId)
  if (!product) {
    throw new AppError('NOT_FOUND', 'Product not found', 404)
  }

  return updateAdminProductInventory(productId, input)
}
