import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AppErrorBoundary } from '@/components/error/AppErrorBoundary'
import { AdminRoute } from '@/components/routes/AdminRoute'
import { PublicOnlyRoute } from '@/components/routes/PublicOnlyRoute'
import { ProtectedRoute } from '@/components/routes/ProtectedRoute'
import { RouteGateLoader } from '@/components/routes/RouteGateLoader'
import { AuthSessionProvider, useAuthSession } from '@/hooks/useAuthSession'

const LandingPage = lazy(async () => ({ default: (await import('@/pages/LandingPage')).LandingPage }))
const ProductsPage = lazy(async () => ({ default: (await import('@/pages/ProductsPage')).ProductsPage }))
const LoginPage = lazy(async () => ({ default: (await import('@/pages/LoginPage')).LoginPage }))
const SignupPage = lazy(async () => ({ default: (await import('@/pages/SignupPage')).SignupPage }))
const OrdersPage = lazy(async () => ({ default: (await import('@/pages/OrdersPage')).OrdersPage }))
const OrderDetailPage = lazy(async () => ({ default: (await import('@/pages/OrderDetailPage')).OrderDetailPage }))
const CartPage = lazy(async () => ({ default: (await import('@/pages/CartPage')).CartPage }))
const CheckoutPreviewPage = lazy(async () => ({ default: (await import('@/pages/CheckoutPreviewPage')).CheckoutPreviewPage }))
const AdminPage = lazy(async () => ({ default: (await import('@/pages/AdminPage')).AdminPage }))
const AdminOrdersPage = lazy(async () => ({ default: (await import('@/pages/AdminOrdersPage')).AdminOrdersPage }))

function AppRoutes() {
  const { bootstrapping } = useAuthSession()

  if (bootstrapping) {
    return <RouteGateLoader />
  }

  return (
    <Suspense fallback={<RouteGateLoader />}>
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
    </Suspense>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <AuthSessionProvider>
        <AppRoutes />
      </AuthSessionProvider>
    </AppErrorBoundary>
  )
}

export default App
