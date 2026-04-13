import type { Request, Response } from 'express'
import { listProductsCoreController } from '../core/products.core-controller.js'

export async function listProductsApiController(_req: Request, res: Response) {
  const products = await listProductsCoreController()
  res.json({ data: products })
}
