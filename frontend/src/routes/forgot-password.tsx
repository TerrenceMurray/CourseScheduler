import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowLeft, Loader2, KeyRound } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo, LogoIcon } from '@/components/logo'
import ForgotPasswordForm from '@/components/forms/forgot-password-form'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect to app if already signed in
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/app' })
    }
  }, [user, loading, navigate])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-amber-600" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/marketing">
            <Logo size="md" variant="light" />
          </Link>

          <div className="space-y-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <KeyRound className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Forgot your password?</h2>
              <p className="mt-2 text-primary-foreground/70">
                No worries! Enter your email and we'll send you a link to reset your password.
              </p>
            </div>
          </div>

          <p className="text-xs text-primary-foreground/50">
            A portfolio project by Terrence Murray
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link
            to="/signin"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to sign in</span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm space-y-6">
            {/* Logo for mobile */}
            <div className="flex items-center justify-center lg:hidden">
              <LogoIcon size="lg" />
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
