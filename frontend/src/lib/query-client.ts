import { QueryClient } from '@tanstack/react-query'
import { isApiClientError } from './auth-api'

function isNetworkFailure(error: unknown) {
  if (isApiClientError(error)) {
    return false
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return false
  }

  if (error instanceof TypeError) {
    return true
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('fetch failed') ||
      message.includes('load failed')
    )
  }

  return false
}

function retryTwiceOnNetworkFailure(failureCount: number, error: unknown) {
  if (!isNetworkFailure(error)) {
    return false
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: retryTwiceOnNetworkFailure,
      retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 1500),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: retryTwiceOnNetworkFailure,
      retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 1500),
    },
  },
})
