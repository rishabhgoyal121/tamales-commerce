import { describe, expect, it } from 'vitest'
import { AppError } from '../../src/shared/errors/app-error.js'
import { normalizeProductListQuery } from '../../src/modules/products/core/products.core-controller.js'

describe('product list query normalization', () => {
  it('applies defaults for missing query params', () => {
    const normalized = normalizeProductListQuery({})

    expect(normalized).toMatchObject({
      page: 1,
      limit: 12,
      sort: 'createdAt_desc',
    })
  })

  it('rejects unknown filter keys', () => {
    expect(() => normalizeProductListQuery({ foo: 'bar' })).toThrowError(AppError)

    try {
      normalizeProductListQuery({ foo: 'bar' })
    } catch (error) {
      const appError = error as AppError
      expect(appError.statusCode).toBe(422)
      expect(appError.code).toBe('VALIDATION_ERROR')
    }
  })

  it('rejects invalid sort values', () => {
    expect(() => normalizeProductListQuery({ sort: 'DROP_TABLE' })).toThrowError(AppError)
  })

  it('caps limit to max allowed value', () => {
    const normalized = normalizeProductListQuery({ limit: '100' })
    expect(normalized.limit).toBe(48)
  })

  it('parses valid filter and paging params', () => {
    const normalized = normalizeProductListQuery({
      q: 'charger',
      categoryId: 'cat_1',
      minPrice: '1000',
      maxPrice: '9999',
      page: '2',
      limit: '20',
      sort: 'price_asc',
    })

    expect(normalized).toEqual({
      q: 'charger',
      categoryId: 'cat_1',
      minPrice: 1000,
      maxPrice: 9999,
      page: 2,
      limit: 20,
      sort: 'price_asc',
    })
  })
})
