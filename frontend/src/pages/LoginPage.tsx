import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { parseApiValidationDetails } from '@/lib/api-error'
import { type LoginFormValues, loginSchema } from '@/lib/validation/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { busy, submitAuth } = useAuthSession()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, submitCount, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await submitAuth('login', values.email, values.password)
      const redirectFromState = (location.state as { from?: string } | null)?.from
      const redirectFromQuery = searchParams.get('next')
      navigate(redirectFromQuery || redirectFromState || '/products', { replace: true })
    } catch (error) {
      const { fieldErrors, formErrors } = parseApiValidationDetails(error)

      if (fieldErrors.email?.[0]) {
        setError('email', { type: 'server', message: fieldErrors.email[0] })
      }
      if (fieldErrors.password?.[0]) {
        setError('password', { type: 'server', message: fieldErrors.password[0] })
      }
      if (formErrors[0]) {
        setError('root', { type: 'server', message: formErrors[0] })
      }
    }
  }
  const showEmailError = !!errors.email && (touchedFields.email || submitCount > 0)
  const showPasswordError = !!errors.password && (touchedFields.password || submitCount > 0)
  const showRootError = !!errors.root && submitCount > 0

  return (
    <>
      <Seo title="Login | Tamales Commerce" description="Sign in to access cart, checkout, and order history." />
      <Card className="animate-fade-up mx-auto max-w-xl border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Login</CardTitle>
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
            {showEmailError ? <p className="text-xs text-destructive">{errors.email?.message}</p> : null}
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
            {showPasswordError ? (
              <p className="text-xs text-destructive">{errors.password?.message}</p>
            ) : null}
          </div>
          {showRootError ? (
            <p className="text-xs text-destructive">{errors.root?.message}</p>
          ) : null}

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
    </>
  )
}
