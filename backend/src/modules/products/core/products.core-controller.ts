import { listProducts } from '../service/product.service.js'

export async function listProductsCoreController() {
  return listProducts()
}
