import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { type LoginFormValues, loginSchema } from '@/lib/validation/auth'

export function LoginPage() {
  const { busy, submitAuth } = useAuthSession()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await submitAuth('login', values.email, values.password)
  }

  return (
    <Card className="mx-auto max-w-xl border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your account to use cart and checkout.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={busy || isSubmitting} className="w-full">
            {busy || isSubmitting ? 'Please wait...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          No account yet?{' '}
          <Link to="/signup" className="font-medium text-foreground underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
