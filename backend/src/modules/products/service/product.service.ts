export type ProductListItem = {
  id: string
  title: string
  price: number
}

export async function listProducts(): Promise<ProductListItem[]> {
  return []
}
