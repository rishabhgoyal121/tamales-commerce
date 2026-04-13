import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthSession()

  if (isAuthenticated) {
    return <Navigate to="/cart" replace />
  }

  return <Outlet />
}
