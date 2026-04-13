import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Tamales Commerce</p>
            <h1 className="mt-2 text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              The page crashed unexpectedly. Refresh to recover or return to home.
            </p>
            {this.state.message ? (
              <p className="mt-3 rounded-md bg-slate-50 p-2 text-xs text-slate-700">{this.state.message}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
              <a
                href="/"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
              >
                Go Home
              </a>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
