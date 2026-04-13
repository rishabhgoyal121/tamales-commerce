import { describe, expect, it } from 'vitest'
import { getHealthApiController } from '../../src/modules/health/api/health-api.controller.js'

describe('GET /api/v1/health', () => {
  it('returns API status and DB health indicator', async () => {
    const req = {} as never
    const result: { payload?: unknown } = {}
    const res = {
      json(payload: unknown) {
        result.payload = payload
      },
    } as never

    await getHealthApiController(req, res)

    expect(result.payload).toMatchObject({
      status: 'ok',
      services: {
        api: 'up',
      },
    })
  })
})
