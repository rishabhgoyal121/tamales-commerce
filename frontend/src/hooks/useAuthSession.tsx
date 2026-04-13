import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  adminCheck,
  isApiClientError,
  login,
  logout,
  me,
  refreshSession,
  register,
  type AuthUser,
} from '@/lib/auth-api'
import { toStatusMessage } from '@/lib/api-error'
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notify'

type AuthMode = 'login' | 'register'

type AuthSessionContextValue = {
  user: AuthUser | null
  accessToken: string
  isAuthenticated: boolean
  bootstrapping: boolean
  busy: boolean
  statusMessage: string
  setStatusMessage: (value: string) => void
  submitAuth: (mode: AuthMode, email: string, password: string) => Promise<void>
  checkMe: () => Promise<void>
  refresh: () => Promise<void>
  checkAdmin: () => Promise<void>
  clearSession: (reason?: string) => void
  signOut: () => Promise<void>
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [bootstrapping, setBootstrapping] = useState(true)
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Checking existing session...')

  const queryClient = useQueryClient()

  const clearSession = (reason = 'Session expired. Please login again.') => {
    setUser(null)
    setAccessToken('')
    queryClient.removeQueries({ queryKey: ['cart'] })
    queryClient.removeQueries({ queryKey: ['checkout-preview'] })
    setStatusMessage(reason)
    notifyInfo(reason)
  }

  const mapApiError = (error: unknown, fallback: string) => {
    if (isApiClientError(error)) {
      if (error.status === 401) {
        clearSession('Session expired. Please login again.')
      }
      return toStatusMessage(error, fallback)
    }
    return toStatusMessage(error, fallback)
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshed = await refreshSession()
        setUser(refreshed.data.user)
        setAccessToken(refreshed.data.accessToken)
        setStatusMessage('Session restored from refresh token cookie.')
      } catch {
        setStatusMessage('No active session. Please login or register.')
      } finally {
        setBootstrapping(false)
      }
    }

    void bootstrap()
  }, [])

  const submitAuth = async (mode: AuthMode, email: string, password: string) => {
    setBusy(true)
    try {
      const response =
        mode === 'login' ? await login(email, password) : await register(email, password)

      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
      setStatusMessage(
        mode === 'login'
          ? 'Login successful. Access token stored in memory.'
          : 'Registration successful. You are now signed in.',
      )
      notifySuccess(mode === 'login' ? 'Welcome back.' : 'Account created and logged in.')
    } catch (error) {
      const message = mapApiError(error, 'Authentication request failed')
      setStatusMessage(message)
      notifyError(message)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const checkMe = async () => {
    setBusy(true)
    try {
      const response = await me(accessToken)
      setStatusMessage(`Authenticated as ${response.data.email} (${response.data.role}).`)
      notifySuccess('Session is valid.')
    } catch (error) {
      const message = mapApiError(error, 'Failed to load /auth/me')
      setStatusMessage(message)
      notifyError(message)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const refresh = async () => {
    setBusy(true)
    try {
      const response = await refreshSession()
      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
      setStatusMessage('Session refreshed. Access token rotated.')
      notifySuccess('Session refreshed.')
    } catch (error) {
      const message = mapApiError(error, 'Session refresh failed')
      setStatusMessage(message)
      notifyError(message)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const checkAdmin = async () => {
    setBusy(true)
    try {
      const response = await adminCheck(accessToken)
      setStatusMessage(response.data.message)
      notifySuccess('Admin access verified.')
    } catch (error) {
      const message = mapApiError(error, 'Admin check failed')
      setStatusMessage(message)
      notifyError(message)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    try {
      await logout()
      setUser(null)
      setAccessToken('')
      queryClient.removeQueries({ queryKey: ['cart'] })
      queryClient.removeQueries({ queryKey: ['checkout-preview'] })
      setStatusMessage('Logged out. Refresh token revoked on backend.')
      notifyInfo('Logged out successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      setStatusMessage(message)
      notifyError(message)
      throw error
    } finally {
      setBusy(false)
    }
  }

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      bootstrapping,
      busy,
      statusMessage,
      setStatusMessage,
      submitAuth,
      checkMe,
      refresh,
      checkAdmin,
      signOut,
      clearSession,
    }),
    [user, accessToken, bootstrapping, busy, statusMessage],
  )

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)

  if (!context) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }

  return context
}
