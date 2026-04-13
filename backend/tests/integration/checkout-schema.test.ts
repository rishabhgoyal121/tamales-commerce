import { describe, expect, it } from 'vitest'
import {
  placeOrderSchema,
  previewCheckoutSchema,
} from '../../src/modules/checkout/schema/checkout.schema.js'

describe('checkout preview schema validation', () => {
  it('accepts optional coupon code', () => {
    const parsed = previewCheckoutSchema.safeParse({ couponCode: 'SAVE10' })
    expect(parsed.success).toBe(true)
  })

  it('accepts empty payload', () => {
    const parsed = previewCheckoutSchema.safeParse({})
    expect(parsed.success).toBe(true)
  })

  it('accepts valid place order payload', () => {
    const parsed = placeOrderSchema.safeParse({
      couponCode: 'SAVE10',
      paymentOutcome: 'AUTHORIZED',
      address: {
        fullName: 'Rishabh Goyal',
        line1: '221B Baker Street',
        city: 'London',
        state: 'Greater London',
        postalCode: 'NW1',
        country: 'UK',
      },
    })
    expect(parsed.success).toBe(true)
  })
})
