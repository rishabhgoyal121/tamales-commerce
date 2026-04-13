import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  adminCheck,
  login,
  logout,
  me,
  refreshSession,
  register,
  type AuthUser,
} from '@/lib/auth-api'

type AuthMode = 'login' | 'register'

type AuthSessionContextValue = {
  user: AuthUser | null
  accessToken: string
  isAuthenticated: boolean
  busy: boolean
  statusMessage: string
  setStatusMessage: (value: string) => void
  submitAuth: (mode: AuthMode, email: string, password: string) => Promise<void>
  checkMe: () => Promise<void>
  refresh: () => Promise<void>
  checkAdmin: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Checking existing session...')

  const queryClient = useQueryClient()

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshed = await refreshSession()
        setUser(refreshed.data.user)
        setAccessToken(refreshed.data.accessToken)
        setStatusMessage('Session restored from refresh token cookie.')
      } catch {
        setStatusMessage('No active session. Please login or register.')
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Authentication request failed')
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to load /auth/me')
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Session refresh failed')
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Admin check failed')
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
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Logout failed')
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
      busy,
      statusMessage,
      setStatusMessage,
      submitAuth,
      checkMe,
      refresh,
      checkAdmin,
      signOut,
    }),
    [user, accessToken, busy, statusMessage],
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
