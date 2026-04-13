import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { parseApiValidationDetails } from '@/lib/api-error'
import { signupSchema, type SignupFormValues } from '@/lib/validation/auth'

export function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { busy, submitAuth } = useAuthSession()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, submitCount, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignupFormValues) => {
    try {
      await submitAuth('register', values.email, values.password)
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
      <Seo title="Sign Up | Tamales Commerce" description="Create an account to start shopping and placing orders." />
      <Card className="animate-fade-up mx-auto max-w-xl border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account and start exploring the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {showEmailError ? <p className="text-xs text-destructive">{errors.email?.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="At least 8 chars, one uppercase and one number"
              autoComplete="new-password"
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
            {busy || isSubmitting ? 'Please wait...' : 'Create account'}
          </Button>
        </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  )
}
