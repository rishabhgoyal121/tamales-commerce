import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { authenticate } from '../../src/shared/middleware/authenticate.js'
import { signAccessToken } from '../../src/shared/auth/jwt.js'

describe('authenticate middleware', () => {
  it('rejects request when bearer token is missing', () => {
    const req = { headers: {} } as Request
    const res = {} as Response
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const [error] = next.mock.calls[0]
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('attaches auth context when bearer token is valid', () => {
    const token = signAccessToken({
      sub: 'user_1',
      role: 'ADMIN',
      email: 'admin@example.com',
    })

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request
    const res = {} as Response
    const next = vi.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(req.auth).toMatchObject({
      userId: 'user_1',
      role: 'ADMIN',
      email: 'admin@example.com',
    })
  })
})
