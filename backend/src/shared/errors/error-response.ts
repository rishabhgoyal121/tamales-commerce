import type { Request } from 'express'

type ErrorEnvelopeInput = {
  code: string
  message: string
  details?: unknown
  status: number
}

export function buildErrorEnvelope(req: Request, input: ErrorEnvelopeInput) {
  return {
    error: {
      code: input.code,
      message: input.message,
      details: input.details ?? [],
      status: input.status,
      path: req.originalUrl,
      requestId: req.requestId ?? '',
      timestamp: new Date().toISOString(),
    },
  }
}
