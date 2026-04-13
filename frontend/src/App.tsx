import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminRoute } from '@/components/routes/AdminRoute'
import { PublicOnlyRoute } from '@/components/routes/PublicOnlyRoute'
import { ProtectedRoute } from '@/components/routes/ProtectedRoute'
import { RouteGateLoader } from '@/components/routes/RouteGateLoader'
import { AuthSessionProvider, useAuthSession } from '@/hooks/useAuthSession'
import { AdminPage } from '@/pages/AdminPage'
import { AdminOrdersPage } from '@/pages/AdminOrdersPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPreviewPage } from '@/pages/CheckoutPreviewPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { SignupPage } from '@/pages/SignupPage'

function AppRoutes() {
  const { bootstrapping } = useAuthSession()

  if (bootstrapping) {
    return <RouteGateLoader />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/products" element={<ProductsPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout-preview" element={<CheckoutPreviewPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
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
