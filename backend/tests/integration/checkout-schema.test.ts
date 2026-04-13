import { describe, expect, it } from 'vitest'
import { previewCheckoutSchema } from '../../src/modules/checkout/schema/checkout.schema.js'

describe('checkout preview schema validation', () => {
  it('accepts optional coupon code', () => {
    const parsed = previewCheckoutSchema.safeParse({ couponCode: 'SAVE10' })
    expect(parsed.success).toBe(true)
  })

  it('accepts empty payload', () => {
    const parsed = previewCheckoutSchema.safeParse({})
    expect(parsed.success).toBe(true)
  })
})
