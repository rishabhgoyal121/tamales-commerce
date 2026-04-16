import { prisma } from '../../../shared/prisma/client.js'
import type {
  AdminCategoryOption,
  AdminProductListQuery,
  AdminProductListResult,
  CreateAdminProductInput,
  ProductDetailResult,
  ProductListQuery,
  ProductListResult,
  ProductReviewListQuery,
  ProductReviewListResult,
  UpdateAdminProductInput,
  UpdateAdminProductInventoryInput,
  UpsertProductReviewInput,
} from '../products.types.js'

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

const ADMIN_SORT_TO_PRISMA_ORDER_BY: Record<
  AdminProductListQuery['sort'],
  {
    createdAt?: 'asc' | 'desc'
    updatedAt?: 'asc' | 'desc'
    priceCents?: 'asc' | 'desc'
    title?: 'asc' | 'desc'
  }
> = {
  createdAt_desc: { createdAt: 'desc' },
  createdAt_asc: { createdAt: 'asc' },
  price_asc: { priceCents: 'asc' },
  price_desc: { priceCents: 'desc' },
  title_asc: { title: 'asc' },
  updatedAt_desc: { updatedAt: 'desc' },
}

const REVIEW_SORT_TO_ORDER_BY: Record<
  ProductReviewListQuery['sort'],
  { createdAt?: 'asc' | 'desc'; rating?: 'asc' | 'desc' }
> = {
  createdAt_desc: { createdAt: 'desc' },
  rating_desc: { rating: 'desc' },
  rating_asc: { rating: 'asc' },
}

type RatingBreakdown = Record<'1' | '2' | '3' | '4' | '5', number>
const NSFW_KEYWORDS = [
  'adult',
  'nsfw',
  'xxx',
  'porn',
  'sex',
  'nude',
  'lingerie',
  'erotic',
]

function nsfwKeywordPredicates(field: 'title' | 'description') {
  return NSFW_KEYWORDS.map((term) => ({
    [field]: {
      contains: term,
      mode: 'insensitive' as const,
    },
  }))
}

function getPublicVisibilityWhere(includeNsfw: boolean) {
  if (includeNsfw) {
    return {}
  }

  return {
    NOT: {
      OR: [
        { isNsfw: true },
        ...nsfwKeywordPredicates('title'),
        ...nsfwKeywordPredicates('description'),
      ],
    },
  }
}

function buildRatingSummary(ratings: number[]) {
  const breakdown: RatingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  for (const rating of ratings) {
    const key = String(rating) as keyof RatingBreakdown
    if (key in breakdown) {
      breakdown[key] += 1
    }
  }

  const ratingCount = ratings.length
  const ratingAverage = ratingCount
    ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratingCount).toFixed(1))
    : 0

  return { ratingAverage, ratingCount, ratingBreakdown: breakdown }
}

export async function listProducts(query: ProductListQuery): Promise<ProductListResult> {
  const where = {
    isActive: true,
    ...getPublicVisibilityWhere(query.includeNsfw),
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
        isNsfw: true,
        createdAt: true,
        reviews: {
          select: { rating: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products.map((product) => {
      const ratings = product.reviews.map((review) => review.rating)
      const summary = buildRatingSummary(ratings)

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        priceCents: product.priceCents,
        categoryId: product.categoryId,
        isNsfw: product.isNsfw,
        ratingAverage: summary.ratingAverage,
        ratingCount: summary.ratingCount,
        createdAt: product.createdAt,
      }
    }),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  }
}

function mapProductDetail(product: {
  id: string
  title: string
  slug: string
  description: string
  priceCents: number
  categoryId: string
  isNsfw: boolean
  category: { name: string }
  inventory: { quantity: number } | null
  reviews: Array<{ rating: number }>
  createdAt: Date
  updatedAt: Date
}): ProductDetailResult {
  const ratings = product.reviews.map((review) => review.rating)
  const summary = buildRatingSummary(ratings)

  return {
    data: {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      inventoryQty: product.inventory?.quantity ?? 0,
      isNsfw: product.isNsfw,
      ratingAverage: summary.ratingAverage,
      ratingCount: summary.ratingCount,
      ratingBreakdown: summary.ratingBreakdown,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  }
}

export async function getPublicProductDetailById(
  productId: string,
  includeNsfw: boolean,
): Promise<ProductDetailResult | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      ...getPublicVisibilityWhere(includeNsfw),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
      categoryId: true,
      isNsfw: true,
      category: {
        select: {
          name: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!product) {
    return null
  }

  return mapProductDetail(product)
}

export async function getPublicProductDetailBySlug(
  slug: string,
  includeNsfw: boolean,
): Promise<ProductDetailResult | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      ...getPublicVisibilityWhere(includeNsfw),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
      categoryId: true,
      isNsfw: true,
      category: {
        select: {
          name: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!product) {
    return null
  }

  return mapProductDetail(product)
}

export async function listProductReviews(
  productId: string,
  query: ProductReviewListQuery,
): Promise<ProductReviewListResult> {
  const where = { productId }
  const skip = (query.page - 1) * query.limit
  const take = query.limit

  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({
      where,
      orderBy: REVIEW_SORT_TO_ORDER_BY[query.sort],
      skip,
      take,
      select: {
        id: true,
        productId: true,
        userId: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.productReview.count({ where }),
  ])

  return {
    data: reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userEmail: review.user.email,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  }
}

export async function upsertProductReview(
  productId: string,
  userId: string,
  input: UpsertProductReviewInput,
) {
  const review = await prisma.productReview.upsert({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    update: {
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment ?? null,
    },
    create: {
      productId,
      userId,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment ?? null,
    },
    select: {
      id: true,
      productId: true,
      userId: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  return {
    data: {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userEmail: review.user.email,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    },
  }
}

export async function listAdminProducts(query: AdminProductListQuery): Promise<AdminProductListResult> {
  const where = {
    ...(query.q
      ? {
          title: {
            contains: query.q,
            mode: 'insensitive' as const,
          },
        }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
  }

  const skip = (query.page - 1) * query.limit
  const take = query.limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: ADMIN_SORT_TO_PRISMA_ORDER_BY[query.sort],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        priceCents: true,
        isActive: true,
        isNsfw: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
        inventory: {
          select: {
            quantity: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    data: products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      isActive: product.isActive,
      isNsfw: product.isNsfw,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      inventoryQty: product.inventory?.quantity ?? 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  }
}

export async function listAdminCategoryOptions(): Promise<AdminCategoryOption[]> {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })
}

export async function getCategoryById(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
      isActive: true,
      isNsfw: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      inventory: {
        select: { quantity: true },
      },
    },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  })
}

export async function createAdminProduct(input: CreateAdminProductInput) {
  const created = await prisma.product.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      priceCents: input.priceCents,
      categoryId: input.categoryId,
      isActive: input.isActive,
      isNsfw: input.isNsfw,
      inventory: {
        create: {
          quantity: input.inventoryQty,
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
      isActive: true,
      isNsfw: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      inventory: {
        select: { quantity: true },
      },
    },
  })

  return {
    data: {
      id: created.id,
      title: created.title,
      slug: created.slug,
      description: created.description,
      priceCents: created.priceCents,
      isActive: created.isActive,
      isNsfw: created.isNsfw,
      categoryId: created.categoryId,
      categoryName: created.category.name,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      inventoryQty: created.inventory?.quantity ?? 0,
    },
  }
}

export async function updateAdminProduct(productId: string, input: UpdateAdminProductInput) {
  const updated = await prisma.product.update({
    where: { id: productId },
    data: input,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
      isActive: true,
      isNsfw: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      inventory: {
        select: { quantity: true },
      },
    },
  })

  return {
    data: {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      description: updated.description,
      priceCents: updated.priceCents,
      isActive: updated.isActive,
      isNsfw: updated.isNsfw,
      categoryId: updated.categoryId,
      categoryName: updated.category.name,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      inventoryQty: updated.inventory?.quantity ?? 0,
    },
  }
}

export async function updateAdminProductInventory(
  productId: string,
  input: UpdateAdminProductInventoryInput,
) {
  const inventory = await prisma.inventory.upsert({
    where: { productId },
    update: { quantity: input.quantity },
    create: {
      productId,
      quantity: input.quantity,
    },
    select: {
      id: true,
      productId: true,
      quantity: true,
      updatedAt: true,
    },
  })

  return { data: inventory }
}
