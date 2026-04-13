import type { Request, Response } from 'express'
import { listProductsCoreController } from '../core/products.core-controller.js'

export async function listProductsApiController(req: Request, res: Response) {
  const result = await listProductsCoreController(req.query as Record<string, unknown>)
  res.json(result)
}
