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
  inventoryQty: number
}

export type UpdateAdminProductInput = {
  title?: string
  description?: string
  priceCents?: number
  categoryId?: string
  isActive?: boolean
}

export type UpdateAdminProductInventoryInput = {
  quantity: number
}
