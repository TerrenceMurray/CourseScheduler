import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  BookOpen,
  BarChart3,
  Github,
  Code2,
  Layers,
  Menu,
  Tag,
  DoorOpen,
  LayoutDashboard,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo, LogoIcon } from '@/components/logo'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/marketing')({
  component: MarketingPage,
})

function MarketingPage() {
  const { user, loading } = useAuth()
  const features = [
    {
      icon: Zap,
      title: 'Smart Scheduling',
      description: 'Generate conflict-free schedules with intelligent algorithms.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: BarChart3,
      title: 'Resource Management',
      description: 'Track rooms, buildings, and utilization at a glance.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Layers,
      title: 'Modern Stack',
      description: 'Built with React 19, TanStack Router, and Tailwind CSS.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ]

  const steps = [
    {
      step: 1,
      icon: Building2,
      title: 'Add Buildings',
      description: 'Register your campus buildings where classes will be held.',
      color: 'text-blue-500',
      bg: 'bg-blue-500',
    },
    {
      step: 2,
      icon: Tag,
      title: 'Define Room Types',
      description: 'Create categories like Lecture Hall, Lab, or Tutorial Room.',
      color: 'text-violet-500',
      bg: 'bg-violet-500',
    },
    {
      step: 3,
      icon: DoorOpen,
      title: 'Add Rooms',
      description: 'Add rooms with capacity and assign them to buildings.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
    },
    {
      step: 4,
      icon: BookOpen,
      title: 'Create Courses',
      description: 'Define courses with their session requirements.',
      color: 'text-amber-500',
      bg: 'bg-amber-500',
    },
    {
      step: 5,
      icon: Sparkles,
      title: 'Generate Schedule',
      description: 'Let the algorithm create a conflict-free timetable.',
      color: 'text-rose-500',
      bg: 'bg-rose-500',
    },
  ]

  const techStack = [
    { name: 'React 19', category: 'frontend' },
    { name: 'TanStack Router', category: 'frontend' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'shadcn/ui', category: 'frontend' },
    { name: 'TypeScript', category: 'both' },
    { name: 'Vite', category: 'frontend' },
    { name: 'Go', category: 'backend' },
    { name: 'Chi Router', category: 'backend' },
    { name: 'PostgreSQL', category: 'backend' },
    { name: 'SQLc', category: 'backend' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/">
              <Logo size="md" showText className="hidden sm:flex" />
              <LogoIcon size="md" className="sm:hidden" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <a href="#features">Features</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#how-it-works">How It Works</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#tech">Tech Stack</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/TerrenceMurray/CourseScheduler" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1.5 size-4" />
                  GitHub
                </a>
              </Button>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden items-center gap-2 sm:flex">
                {!loading && user ? (
                  <Button size="sm" asChild>
                    <Link to="/app">
                      <LayoutDashboard className="mr-1.5 size-4" />
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/signin">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/signup">Create Account</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 pt-8">
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="#features">Features</a>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="#how-it-works">How It Works</a>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="#tech">Tech Stack</a>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="https://github.com/TerrenceMurray/CourseScheduler" target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 size-4" />
                        GitHub
                      </a>
                    </Button>
                    <div className="my-2 h-px bg-border" />
                    {!loading && user ? (
                      <Button asChild>
                        <Link to="/app">
                          <LayoutDashboard className="mr-2 size-4" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link to="/signin">Sign In</Link>
                        </Button>
                        <Button asChild>
                          <Link to="/signup">Create Account</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/5 via-background to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="relative mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6">
                <Code2 className="mr-1.5 size-3" />
                Portfolio Project
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Course Scheduler
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                A full-stack scheduling application for managing courses, rooms, and timetables.
                Built as a demonstration of modern web development practices.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link to="/app">
                    Explore the App
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="https://github.com/TerrenceMurray/CourseScheduler" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 size-4" />
                    Source Code
                  </a>
                </Button>
              </div>
            </div>

            {/* App Preview */}
            <div className="relative mx-auto mt-16 max-w-4xl lg:mt-20">
              <div className="overflow-hidden rounded-xl border bg-background shadow-2xl">
                <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs text-muted-foreground">Course Scheduler</span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="mb-3 grid grid-cols-6 gap-2">
                    <div className="text-xs font-medium text-muted-foreground" />
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {['9AM', '10AM', '11AM', '12PM', '1PM'].map((time, i) => (
                      <div key={time} className="grid grid-cols-6 gap-2">
                        <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground">
                          {time}
                        </div>
                        {[0, 1, 2, 3, 4].map((day) => {
                          const schedule = [
                            [1, 0, 1, 0, 1],
                            [0, 1, 0, 1, 0],
                            [1, 1, 0, 0, 1],
                            [0, 0, 1, 1, 0],
                            [1, 0, 0, 1, 1],
                          ]
                          const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500']
                          const hasClass = schedule[i][day]
                          return (
                            <div
                              key={day}
                              className={`h-8 rounded-md transition-colors sm:h-10 ${hasClass ? colors[(i + day) % colors.length] : 'bg-muted/40'}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  No conflicts detected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-b py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Key Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A comprehensive scheduling solution built with best practices
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}>
                      <feature.icon className={`size-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="scroll-mt-16 border-b bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get from zero to a complete schedule in five simple steps
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-4xl">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-6 top-8 bottom-8 hidden w-0.5 bg-linear-to-b from-blue-500 via-emerald-500 to-rose-500 md:block" />

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div
                      key={step.step}
                      className="relative flex flex-col gap-4 md:flex-row md:gap-8"
                    >
                      {/* Step number circle */}
                      <div className="flex shrink-0 items-start gap-4 md:w-12">
                        <div className={`relative z-10 flex size-12 items-center justify-center rounded-full ${step.bg} text-white font-bold text-lg shadow-lg`}>
                          {step.step}
                        </div>
                      </div>

                      {/* Content card */}
                      <Card className="flex-1 transition-all hover:shadow-md hover:border-primary/20">
                        <CardContent className="flex items-start gap-4 p-5">
                          <div className={`shrink-0 rounded-lg p-2.5 ${step.bg}/10`}>
                            <step.icon className={`size-5 ${step.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <ArrowRight className="hidden size-5 shrink-0 text-muted-foreground/50 lg:block" />
                          )}
                          {index === steps.length - 1 && (
                            <CheckCircle2 className="hidden size-5 shrink-0 text-emerald-500 lg:block" />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA after steps */}
              <div className="mt-12 text-center">
                <Button size="lg" asChild>
                  <Link to="/app">
                    Start Setting Up
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10">
                    <BookOpen className="size-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold">24</div>
                <div className="mt-1 text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-violet-500/10">
                    <Building2 className="size-5 text-violet-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold">18</div>
                <div className="mt-1 text-sm text-muted-foreground">Rooms</div>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <Calendar className="size-5 text-emerald-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold">142</div>
                <div className="mt-1 text-sm text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Clock className="size-5 text-amber-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold">213h</div>
                <div className="mt-1 text-sm text-muted-foreground">Teaching Hours</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="tech" className="scroll-mt-16 border-b py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built With
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Modern technologies for a great developer experience
              </p>
            </div>
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
              {techStack.map((tech) => (
                <Badge
                  key={tech.name}
                  variant={tech.category === 'backend' ? 'outline' : 'secondary'}
                  className="px-4 py-2 text-sm"
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="mx-auto max-w-3xl border-primary/10 bg-linear-to-br from-primary/5 via-violet-500/5 to-primary/5">
              <CardContent className="p-8 text-center sm:p-12">
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Ready to explore?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                  Check out the full application with sample data and see the scheduler in action
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button size="lg" asChild>
                    <Link to="/app">
                      {user ? 'Go to Dashboard' : 'Launch App'}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  {!user && (
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/signup">Create Account</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LogoIcon size="sm" />
              <span>Course Scheduler — A portfolio project</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com/TerrenceMurray/CourseScheduler" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1.5 size-4" />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
