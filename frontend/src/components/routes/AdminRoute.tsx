import { Navigate, Outlet } from 'react-router-dom'
import { useAuthSession } from '@/hooks/useAuthSession'

export function AdminRoute() {
  const { user } = useAuthSession()

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/cart" replace />
  }

  return <Outlet />
}
