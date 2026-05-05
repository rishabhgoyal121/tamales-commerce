import { EngagingLoader } from '@/components/common/EngagingLoader'

export function RouteGateLoader() {
  return <EngagingLoader title="Restoring your session" subtitle="Checking saved login and route access." className="min-h-[40vh]" />
}
