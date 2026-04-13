import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/seo/Seo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSession } from '@/hooks/useAuthSession'

export function AdminPage() {
  const { user, busy, checkAdmin } = useAuthSession()

  return (
    <>
      <Seo title="Admin Console | Tamales Commerce" description="Manage admin operations and monitor marketplace workflows." />
      <Card className="border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Admin Console</CardTitle>
          <CardDescription>
            This route is protected by admin guard. Current role: {user?.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void checkAdmin()} disabled={busy}>
              Verify Admin Access
            </Button>
            <Link
              to="/admin/orders"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Open Admin Orders
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
