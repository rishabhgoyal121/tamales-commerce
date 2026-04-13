import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'

const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

export type AccessTokenPayload = {
  sub: string
  role: string
  email: string
}

export type RefreshTokenPayload = {
  sub: string
  tokenId: string
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TTL_SECONDS,
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL_SECONDS,
  })
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getRefreshTokenExpiryDate() {
  return new Date(Date.now() + REFRESH_TTL_SECONDS * 1000)
}

export function getRefreshCookieOptions() {
  const isProduction = env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction,
    path: '/api/v1/auth',
    maxAge: REFRESH_TTL_SECONDS * 1000,
  }
}
