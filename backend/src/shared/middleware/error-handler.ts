import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error.js'
import { buildErrorEnvelope } from '../errors/error-response.js'
import { logger } from '../logger/logger.js'

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
      },
      'Handled application error',
    )

    res
      .status(err.statusCode)
      .json(
        buildErrorEnvelope(req, {
          code: err.code,
          message: err.message,
          details: err.details,
          status: err.statusCode,
        }),
      )

    return
  }

  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      err,
    },
    'Unhandled internal error',
  )

  res
    .status(500)
    .json(
      buildErrorEnvelope(req, {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
        status: 500,
      }),
    )
}
