import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error.js'
import { logger } from '../logger/logger.js'

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn(
      {
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
      },
      'Handled application error',
    )

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? [],
      },
    })

    return
  }

  logger.error(
    {
      method: req.method,
      path: req.path,
      err,
    },
    'Unhandled internal error',
  )

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      details: [],
    },
  })
}
