import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'
import { RouteGateLoader } from '@/components/routes/RouteGateLoader'

export function AdminRoute() {
  const { user, bootstrapping } = useAuthSession()

  if (bootstrapping) {
    return <RouteGateLoader />
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/cart" replace />
  }

  return <Outlet />
}
