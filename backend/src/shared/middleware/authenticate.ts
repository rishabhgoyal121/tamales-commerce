import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@prisma/client'
import { AppError } from '../errors/app-error.js'
import { verifyAccessToken } from '../auth/jwt.js'

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('UNAUTHORIZED', 'Missing or invalid Authorization header', 401))
    return
  }

  const token = authorization.slice('Bearer '.length)

  try {
    const payload = verifyAccessToken(token)
    req.auth = {
      userId: payload.sub,
      role: payload.role as UserRole,
      email: payload.email,
    }
    next()
  } catch {
    next(new AppError('UNAUTHORIZED', 'Invalid or expired access token', 401))
  }
}
