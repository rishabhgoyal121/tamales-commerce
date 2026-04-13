import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import { previewCheckoutSchema } from '../schema/checkout.schema.js'
import { previewCheckoutCoreController } from '../core/checkout.core-controller.js'

export async function previewCheckoutApiController(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  const parsed = previewCheckoutSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Invalid checkout preview payload',
      422,
      parsed.error.flatten(),
    )
  }

  const preview = await previewCheckoutCoreController(req.auth.userId, parsed.data.couponCode)
  res.json(preview)
}
