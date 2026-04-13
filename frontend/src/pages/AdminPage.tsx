import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthSession } from '@/hooks/useAuthSession'

export function AdminPage() {
  const { user, busy, checkAdmin } = useAuthSession()

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Admin Console</CardTitle>
        <CardDescription>
          This route is protected by admin guard. Current role: {user?.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => void checkAdmin()} disabled={busy}>
          Verify Admin Access
        </Button>
      </CardContent>
    </Card>
  )
}
