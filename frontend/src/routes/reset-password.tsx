import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo, LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import ResetPasswordForm from '@/components/forms/reset-password-form'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Check if we have a valid recovery session
  const hasValidSession = !!user

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-emerald-600" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/marketing">
            <Logo size="md" variant="light" />
          </Link>

          <div className="space-y-6">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <ShieldCheck className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Create a new password</h2>
              <p className="mt-2 text-primary-foreground/70">
                Choose a strong password to keep your account secure.
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

            {hasValidSession ? (
              <>
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your new password below
                  </p>
                </div>

                <ResetPasswordForm />
              </>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-6 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Invalid or expired link</h3>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/forgot-password">Request new link</Link>
                </Button>
                <div className="text-center">
                  <Link
                    to="/signin"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
