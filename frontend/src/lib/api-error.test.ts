import { describe, expect, it } from 'vitest'
import { ApiClientError } from '@/lib/auth-api'
import { parseApiValidationDetails, toStatusMessage } from '@/lib/api-error'

describe('parseApiValidationDetails', () => {
  it('extracts zod-style field and form errors for 422 responses', () => {
    const error = new ApiClientError('Invalid payload', 422, 'VALIDATION_ERROR', {
      fieldErrors: {
        email: ['Enter a valid email'],
        password: ['Password must be at least 8 characters'],
      },
      formErrors: ['Request payload is malformed'],
    }, 'req_test_12345678')

    const parsed = parseApiValidationDetails(error)

    expect(parsed.fieldErrors.email?.[0]).toBe('Enter a valid email')
    expect(parsed.fieldErrors.password?.[0]).toBe('Password must be at least 8 characters')
    expect(parsed.formErrors[0]).toBe('Request payload is malformed')
    expect(parsed.requestId).toBe('req_test_12345678')
  })

  it('returns empty structures for non-422 errors', () => {
    const error = new ApiClientError('Unauthorized', 401, 'UNAUTHORIZED', [], 'req_unauth_123')

    const parsed = parseApiValidationDetails(error)

    expect(parsed.fieldErrors).toEqual({})
    expect(parsed.formErrors).toEqual([])
    expect(parsed.requestId).toBe('req_unauth_123')
  })
})

describe('toStatusMessage', () => {
  it('includes shortened request reference for ApiClientError', () => {
    const error = new ApiClientError('Forbidden', 403, 'FORBIDDEN', [], 'request_abcdef123456')
    expect(toStatusMessage(error, 'fallback')).toBe('Forbidden (ref: request_)')
  })

  it('uses fallback for unknown values', () => {
    expect(toStatusMessage(null, 'fallback')).toBe('fallback')
  })
})
