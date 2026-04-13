import { prisma } from '../../../shared/prisma/client.js'
import type { ProductListQuery, ProductListResult } from '../products.types.js'

const SORT_TO_PRISMA_ORDER_BY: Record<
  ProductListQuery['sort'],
  { createdAt?: 'asc' | 'desc'; priceCents?: 'asc' | 'desc'; title?: 'asc' | 'desc' }
> = {
  createdAt_desc: { createdAt: 'desc' },
  createdAt_asc: { createdAt: 'asc' },
  price_asc: { priceCents: 'asc' },
  price_desc: { priceCents: 'desc' },
  title_asc: { title: 'asc' },
}

export async function listProducts(query: ProductListQuery): Promise<ProductListResult> {
  const where = {
    isActive: true,
    ...(query.q
      ? {
          title: {
            contains: query.q,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          priceCents: {
            gte: query.minPrice,
            lte: query.maxPrice,
          },
        }
      : {}),
  }

  const skip = (query.page - 1) * query.limit
  const take = query.limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORT_TO_PRISMA_ORDER_BY[query.sort],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        priceCents: true,
        categoryId: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  }
}
