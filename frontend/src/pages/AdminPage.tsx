import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'

export function AdminPage() {
  const { user, busy, checkAdmin } = useAuthSession()

  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Admin Console</h2>
      <p className="mt-1 text-sm text-slate-600">
        This route is protected by admin guard. Current role: {user?.role}
      </p>

      <div className="mt-4">
        <Button onClick={() => void checkAdmin()} disabled={busy}>
          Verify Admin Access
        </Button>
      </div>
    </article>
  )
}
