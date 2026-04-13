import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { requireRole } from '../../src/shared/middleware/require-role.js'

describe('requireRole middleware', () => {
  it('forbids customer for admin route', () => {
    const req = {
      auth: {
        userId: 'u_1',
        role: 'CUSTOMER',
        email: 'user@example.com',
      },
    } as Request
    const res = {} as Response
    const next = vi.fn()

    requireRole('ADMIN')(req, res, next)

    const [error] = next.mock.calls[0]
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
  })

  it('allows admin for admin route', () => {
    const req = {
      auth: {
        userId: 'u_1',
        role: 'ADMIN',
        email: 'admin@example.com',
      },
    } as Request
    const res = {} as Response
    const next = vi.fn()

    requireRole('ADMIN')(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })
})
