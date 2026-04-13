import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from '../../src/modules/auth/schema/auth.schema.js'

describe('auth payload validation', () => {
  it('accepts valid register payload', () => {
    const parsed = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'strongpass123',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects weak password for login payload', () => {
    const parsed = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    })

    expect(parsed.success).toBe(false)
  })
})
