import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { RouteGateLoader } from '@/components/routes/RouteGateLoader'

export function ProtectedRoute() {
  const { isAuthenticated, bootstrapping } = useAuthSession()
  const location = useLocation()

  if (bootstrapping) {
    return <RouteGateLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return <Outlet />
}
