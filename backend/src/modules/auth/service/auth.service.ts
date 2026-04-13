import type { UserRole } from '@prisma/client'
import { prisma } from '../../../shared/prisma/client.js'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  passwordHash: string
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({
    data: { email, passwordHash },
  })
}

export async function createRefreshToken(tokenHash: string, userId: string, expiresAt: Date) {
  return prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  })
}

export async function findValidRefreshToken(tokenHash: string) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  })
}

export async function revokeRefreshToken(tokenHash: string) {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}
