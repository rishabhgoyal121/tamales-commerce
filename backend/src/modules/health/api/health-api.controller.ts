import type { Request, Response } from 'express'
import { getHealthCoreController } from '../core/health.core-controller.js'

export async function getHealthApiController(_req: Request, res: Response) {
  const health = await getHealthCoreController()
  res.json(health)
}
