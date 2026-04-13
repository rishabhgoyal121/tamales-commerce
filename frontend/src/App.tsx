import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminRoute } from '@/components/routes/AdminRoute'
import { ProtectedRoute } from '@/components/routes/ProtectedRoute'
import { AuthSessionProvider, useAuthSession } from '@/hooks/useAuthSession'
import { AdminPage } from '@/pages/AdminPage'
import { AuthPage } from '@/pages/AuthPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPreviewPage } from '@/pages/CheckoutPreviewPage'

function RootRedirect() {
  const { isAuthenticated } = useAuthSession()
  return <Navigate to={isAuthenticated ? '/cart' : '/auth'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout-preview" element={<CheckoutPreviewPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthSessionProvider>
      <AppRoutes />
    </AuthSessionProvider>
  )
}

export default App
