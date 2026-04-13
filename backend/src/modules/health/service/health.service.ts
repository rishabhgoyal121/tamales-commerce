import { prisma } from '../../../shared/prisma/client.js'

export type HealthSnapshot = {
  status: 'ok'
  services: {
    api: 'up'
    db: 'up' | 'down'
  }
}

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  let db: 'up' | 'down' = 'up'

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    db = 'down'
  }

  return {
    status: 'ok',
    services: {
      api: 'up',
      db,
    },
  }
}
