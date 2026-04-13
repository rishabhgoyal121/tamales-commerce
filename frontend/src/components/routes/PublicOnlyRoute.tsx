import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { RouteGateLoader } from '@/components/routes/RouteGateLoader'

export function PublicOnlyRoute() {
  const { isAuthenticated, bootstrapping } = useAuthSession()

  if (bootstrapping) {
    return <RouteGateLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/cart" replace />
  }

  return <Outlet />
}
