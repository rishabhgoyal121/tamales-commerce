import { describe, expect, it } from 'vitest'
import { canTransitionOrderStatus } from '../../src/modules/orders/core/orders.core-controller.js'
import { updateAdminOrderStatusSchema } from '../../src/modules/orders/schema/orders.schema.js'

describe('order status transition matrix', () => {
  it('allows CREATED to CONFIRMED and CANCELLED', () => {
    expect(canTransitionOrderStatus('CREATED', 'CONFIRMED')).toBe(true)
    expect(canTransitionOrderStatus('CREATED', 'CANCELLED')).toBe(true)
  })

  it('rejects invalid transitions', () => {
    expect(canTransitionOrderStatus('CREATED', 'DELIVERED')).toBe(false)
    expect(canTransitionOrderStatus('DELIVERED', 'CANCELLED')).toBe(false)
  })
})

describe('update admin order status schema', () => {
  it('accepts valid payload', () => {
    const parsed = updateAdminOrderStatusSchema.safeParse({
      status: 'PACKED',
      note: 'Packed after quality check',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects invalid status and too-long note', () => {
    const invalidStatus = updateAdminOrderStatusSchema.safeParse({
      status: 'INVALID',
    })
    expect(invalidStatus.success).toBe(false)

    const invalidNote = updateAdminOrderStatusSchema.safeParse({
      status: 'SHIPPED',
      note: 'a'.repeat(281),
    })
    expect(invalidNote.success).toBe(false)
  })
})
