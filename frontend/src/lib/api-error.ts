import { isApiClientError } from '@/lib/auth-api'

export type ApiValidationDetails = {
  fieldErrors: Record<string, string[]>
  formErrors: string[]
  requestId: string | null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseApiValidationDetails(error: unknown): ApiValidationDetails {
  if (!isApiClientError(error) || error.status !== 422 || !isRecord(error.details)) {
    return {
      fieldErrors: {},
      formErrors: [],
      requestId: isApiClientError(error) ? error.requestId : null,
    }
  }

  const rawFieldErrors = error.details.fieldErrors
  const rawFormErrors = error.details.formErrors

  const fieldErrors: Record<string, string[]> = {}

  if (isRecord(rawFieldErrors)) {
    Object.entries(rawFieldErrors).forEach(([key, value]) => {
      if (isStringArray(value) && value.length > 0) {
        fieldErrors[key] = value
      }
    })
  }

  const formErrors = isStringArray(rawFormErrors) ? rawFormErrors : []

  return {
    fieldErrors,
    formErrors,
    requestId: error.requestId,
  }
}

export function toStatusMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) {
    const requestIdSuffix = error.requestId ? ` (ref: ${error.requestId.slice(0, 8)})` : ''
    return `${error.message}${requestIdSuffix}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
