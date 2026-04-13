import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const headerRequestId = req.header('x-request-id')?.trim()
  const requestId = headerRequestId && headerRequestId.length > 0 ? headerRequestId : randomUUID()

  req.requestId = requestId
  res.setHeader('x-request-id', requestId)

  next()
}
