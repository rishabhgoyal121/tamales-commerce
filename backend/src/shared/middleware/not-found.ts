import type { Request, Response } from 'express'
import { buildErrorEnvelope } from '../errors/error-response.js'

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json(
      buildErrorEnvelope(req, {
        code: 'NOT_FOUND',
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        status: 404,
      }),
    )
}
