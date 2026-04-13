import { describe, expect, it } from 'vitest'
import { AppError } from '../../src/shared/errors/app-error.js'
import {
  normalizeAdminOrderListQuery,
  normalizeCustomerOrderListQuery,
} from '../../src/modules/orders/core/orders.core-controller.js'

describe('customer orders query normalization', () => {
  it('applies defaults', () => {
    const normalized = normalizeCustomerOrderListQuery({})

    expect(normalized).toMatchObject({
      page: 1,
      limit: 12,
      sort: 'createdAt_desc',
    })
  })

  it('rejects unknown keys', () => {
    expect(() => normalizeCustomerOrderListQuery({ unknown: '1' })).toThrowError(AppError)
  })

  it('rejects invalid status', () => {
    expect(() => normalizeCustomerOrderListQuery({ status: 'BOGUS' })).toThrowError(AppError)
  })

  it('accepts valid status and sort', () => {
    const normalized = normalizeCustomerOrderListQuery({
      status: 'SHIPPED',
      paymentStatus: 'AUTHORIZED',
      sort: 'total_desc',
      page: '2',
      limit: '20',
    })

    expect(normalized).toEqual({
      status: 'SHIPPED',
      paymentStatus: 'AUTHORIZED',
      page: 2,
      limit: 20,
      sort: 'total_desc',
    })
  })
})

describe('admin orders query normalization', () => {
  it('allows userId filter for admins', () => {
    const normalized = normalizeAdminOrderListQuery({
      userId: 'user_123',
      status: 'CREATED',
      sort: 'createdAt_asc',
    })

    expect(normalized).toMatchObject({
      userId: 'user_123',
      status: 'CREATED',
      sort: 'createdAt_asc',
    })
  })

  it('caps limit and rejects bad sort', () => {
    const capped = normalizeAdminOrderListQuery({ limit: '100' })
    expect(capped.limit).toBe(48)

    expect(() => normalizeAdminOrderListQuery({ sort: 'DROP_TABLE' })).toThrowError(AppError)
  })
})
