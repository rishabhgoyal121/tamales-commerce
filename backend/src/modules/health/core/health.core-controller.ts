import { getHealthSnapshot } from '../service/health.service.js'

export async function getHealthCoreController() {
  return getHealthSnapshot()
}
