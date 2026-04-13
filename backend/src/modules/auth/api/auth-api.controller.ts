import type { Request, Response } from 'express'
import { AppError } from '../../../shared/errors/app-error.js'
import {
  getRefreshCookieOptions,
} from '../../../shared/auth/jwt.js'
import {
  getMeCoreController,
  loginCoreController,
  logoutCoreController,
  refreshCoreController,
  registerCoreController,
} from '../core/auth.core-controller.js'
import { loginSchema, registerSchema } from '../schema/auth.schema.js'

const REFRESH_COOKIE_NAME = 'refreshToken'

export async function registerApiController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid register payload', 422, parsed.error.flatten())
  }

  const result = await registerCoreController(parsed.data.email, parsed.data.password)

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions())
  res.status(201).json({
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

export async function loginApiController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid login payload', 422, parsed.error.flatten())
  }

  const result = await loginCoreController(parsed.data.email, parsed.data.password)

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions())
  res.json({
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

export async function refreshApiController(req: Request, res: Response) {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
  if (!cookieToken) {
    throw new AppError('UNAUTHORIZED', 'Missing refresh token cookie', 401)
  }

  const result = await refreshCoreController(cookieToken)

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions())
  res.json({
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  })
}

export async function logoutApiController(req: Request, res: Response) {
  const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined

  await logoutCoreController(cookieToken)

  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions())
  res.status(204).send()
}

export async function meApiController(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401)
  }

  const user = await getMeCoreController(req.auth.userId)
  res.json({ data: user })
}

export async function adminCheckApiController(_req: Request, res: Response) {
  res.json({ data: { ok: true, message: 'Admin access granted' } })
}
