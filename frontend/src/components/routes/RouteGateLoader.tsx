export function RouteGateLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        Restoring session...
      </div>
    </div>
  )
}
