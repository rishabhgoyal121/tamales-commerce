import { AppError } from '../../../shared/errors/app-error.js'
import crypto from 'node:crypto'
import {
  createRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  findValidRefreshToken,
  revokeRefreshToken,
} from '../service/auth.service.js'
import { hashPassword, verifyPassword } from '../../../shared/auth/password.js'
import {
  getRefreshTokenExpiryDate,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../../shared/auth/jwt.js'

export async function registerCoreController(email: string, password: string) {
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new AppError('CONFLICT', 'User already exists with this email', 409)
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser(email, passwordHash)

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  })

  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: crypto.randomUUID(),
  })

  await createRefreshToken(hashToken(refreshToken), user.id, getRefreshTokenExpiryDate())

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  }
}

export async function loginCoreController(email: string, password: string) {
  const user = await findUserByEmail(email)
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401)
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401)
  }

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  })

  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: crypto.randomUUID(),
  })

  await createRefreshToken(hashToken(refreshToken), user.id, getRefreshTokenExpiryDate())

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  }
}

export async function refreshCoreController(incomingRefreshToken: string) {
  let decoded: { sub: string }

  try {
    decoded = verifyRefreshToken(incomingRefreshToken) as { sub: string }
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401)
  }

  const incomingHash = hashToken(incomingRefreshToken)
  const tokenRecord = await findValidRefreshToken(incomingHash)
  if (!tokenRecord) {
    throw new AppError('UNAUTHORIZED', 'Refresh token is not valid', 401)
  }

  const user = await findUserById(decoded.sub)
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'User not found for refresh token', 401)
  }

  await revokeRefreshToken(incomingHash)

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  })

  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: crypto.randomUUID(),
  })

  await createRefreshToken(hashToken(refreshToken), user.id, getRefreshTokenExpiryDate())

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  }
}

export async function logoutCoreController(incomingRefreshToken?: string) {
  if (!incomingRefreshToken) {
    return
  }

  await revokeRefreshToken(hashToken(incomingRefreshToken))
}

export async function getMeCoreController(userId: string) {
  const user = await findUserById(userId)
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404)
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
}
