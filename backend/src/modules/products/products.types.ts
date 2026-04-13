export type ProductListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'price_asc'
  | 'price_desc'
  | 'title_asc'

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
