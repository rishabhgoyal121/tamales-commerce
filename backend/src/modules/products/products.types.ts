export type ProductListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'price_asc'
  | 'price_desc'
  | 'title_asc'

export type AdminProductListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'price_asc'
  | 'price_desc'
  | 'title_asc'
  | 'updatedAt_desc'

export type ProductListQuery = {
  q?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  includeNsfw: boolean
  page: number
  limit: number
  sort: ProductListSort
}

export type ProductListItem = {
  id: string
  title: string
  slug: string
  priceCents: number
  categoryId: string
  isNsfw: boolean
  ratingAverage: number
  ratingCount: number
  createdAt: Date
}

export type ProductListResult = {
  data: ProductListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ProductDetailResult = {
  data: {
    id: string
    title: string
    slug: string
    description: string
    priceCents: number
    categoryId: string
    categoryName: string
    inventoryQty: number
    isNsfw: boolean
    ratingAverage: number
    ratingCount: number
    ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>
    createdAt: Date
    updatedAt: Date
  }
}

export type ProductReviewListSort = 'createdAt_desc' | 'rating_desc' | 'rating_asc'

export type ProductReviewListQuery = {
  includeNsfw: boolean
  page: number
  limit: number
  sort: ProductReviewListSort
}

export type ProductReviewItem = {
  id: string
  productId: string
  userId: string
  userEmail: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export type ProductReviewListResult = {
  data: ProductReviewItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminProductListQuery = {
  q?: string
  categoryId?: string
  isActive?: boolean
  page: number
  limit: number
  sort: AdminProductListSort
}

export type AdminProductListItem = {
  id: string
  title: string
  slug: string
  description: string
  priceCents: number
  isActive: boolean
  isNsfw: boolean
  categoryId: string
  categoryName: string
  inventoryQty: number
  createdAt: Date
  updatedAt: Date
}

export type AdminProductListResult = {
  data: AdminProductListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminCategoryOption = {
  id: string
  name: string
  slug: string
}

export type CreateAdminProductInput = {
  title: string
  slug: string
  description: string
  priceCents: number
  categoryId: string
  isActive: boolean
  isNsfw: boolean
  inventoryQty: number
}

export type UpdateAdminProductInput = {
  title?: string
  description?: string
  priceCents?: number
  categoryId?: string
  isActive?: boolean
  isNsfw?: boolean
}

export type UpdateAdminProductInventoryInput = {
  quantity: number
}

export type UpsertProductReviewInput = {
  rating: number
  title?: string
  comment?: string
}
