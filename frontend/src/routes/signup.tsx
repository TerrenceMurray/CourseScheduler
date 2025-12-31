import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Zap, Shield, Clock, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo, LogoIcon } from '@/components/logo'
import SignUpForm from '@/components/forms/signup-form'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

function SignUpPage() {
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
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-emerald-600" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/marketing">
            <Logo size="md" variant="light" />
          </Link>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Start scheduling smarter</h2>
              <p className="mt-2 text-primary-foreground/70">
                Join thousands of institutions managing their timetables efficiently.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Zap className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Instant scheduling</p>
                  <p className="text-sm text-primary-foreground/60">
                    Generate conflict-free timetables in seconds
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Shield className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Conflict detection</p>
                  <p className="text-sm text-primary-foreground/60">
                    Automatic room and time slot validation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="font-medium">Save hours weekly</p>
                  <p className="text-sm text-primary-foreground/60">
                    Automate your scheduling workflow
                  </p>
                </div>
              </div>
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
            to="/marketing"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/signin">Sign in</Link>
            </Button>
          </div>
        </header>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm space-y-6">
            {/* Logo for mobile */}
            <div className="flex items-center justify-center lg:hidden">
              <LogoIcon size="lg" />
            </div>

            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Get started with Course Scheduler
              </p>
            </div>

            <SignUpForm />

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
