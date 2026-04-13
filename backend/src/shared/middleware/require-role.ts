import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '@prisma/client'
import { AppError } from '../errors/app-error.js'

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new AppError('UNAUTHORIZED', 'Authentication required', 401))
      return
    }

    if (!roles.includes(req.auth.role)) {
      next(new AppError('FORBIDDEN', 'Insufficient permissions', 403))
      return
    }

    next()
  }
}
