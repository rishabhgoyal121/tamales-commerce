import { describe, expect, it } from 'vitest'
import { addCartItemSchema, updateCartItemSchema } from '../../src/modules/cart/schema/cart.schema.js'

describe('cart schema validation', () => {
  it('accepts valid add item payload', () => {
    const parsed = addCartItemSchema.safeParse({ productId: 'prod_1', quantity: 2 })
    expect(parsed.success).toBe(true)
  })

  it('rejects non-positive quantity', () => {
    const parsed = updateCartItemSchema.safeParse({ quantity: 0 })
    expect(parsed.success).toBe(false)
  })
})
