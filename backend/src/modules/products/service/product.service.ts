import { prisma } from '../../../shared/prisma/client.js'
import type {
  AdminCategoryOption,
  AdminProductListQuery,
  AdminProductListResult,
  CreateAdminProductInput,
  ProductListQuery,
  ProductDetailResult,
  ProductListResult,
  UpdateAdminProductInput,
  UpdateAdminProductInventoryInput,
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

export async function getPublicProductDetailById(productId: string): Promise<ProductDetailResult | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
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
  })

  if (!product) {
    return null
  }

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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
  }
}

export async function getPublicProductDetailBySlug(slug: string): Promise<ProductDetailResult | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceCents: true,
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
  })

  if (!product) {
    return null
  }

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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
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
