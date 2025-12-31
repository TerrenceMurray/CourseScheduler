import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Calendar, Building2, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo, LogoIcon } from '@/components/logo';
import SignInForm from '@/components/forms/signin-form';
import { useAuth } from '@/contexts/auth-context';

export const Route = createFileRoute('/signin')({
  component: SignInPage,
});

function SignInPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to app if already signed in
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: '/app' });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (user) {
    return null;
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Branding */}
      <div className="relative hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-violet-600" />
        <div className="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
          <Link to="/marketing">
            <Logo size="md" variant="light" />
          </Link>

          <div className="space-y-6">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium leading-relaxed">
                "Scheduling used to take hours. Now it takes minutes."
              </p>
              <footer className="text-sm text-primary-foreground/70">
                — A happy demo user
              </footer>
            </blockquote>

            <div className="flex gap-6 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>Smart Scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4" />
                <span>Room Management</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                <span>Course Tracking</span>
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
              <Link to="/signup">Create account</Link>
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
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <SignInForm />

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Create account
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground/60">
              This is a portfolio demo. No real authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
