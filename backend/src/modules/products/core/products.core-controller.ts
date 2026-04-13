import { AppError } from '../../../shared/errors/app-error.js'
import type { ProductListQuery, ProductListSort } from '../products.types.js'
import { listProducts } from '../service/product.service.js'

const ALLOWED_QUERY_KEYS = new Set([
  'q',
  'categoryId',
  'minPrice',
  'maxPrice',
  'page',
  'limit',
  'sort',
])

const ALLOWED_SORTS: readonly ProductListSort[] = [
  'createdAt_desc',
  'createdAt_asc',
  'price_asc',
  'price_desc',
  'title_asc',
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

export async function listProductsCoreController(rawQuery: Record<string, unknown>) {
  const query = normalizeProductListQuery(rawQuery)
  return listProducts(query)
}
