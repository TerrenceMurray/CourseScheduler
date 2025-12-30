import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Settings2,
  Zap,
  BookOpen,
  DoorOpen,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CountUp } from '@/components/count-up'
import { useCourses, useSessions, useRooms, useGenerateAndSaveSchedule } from '@/hooks'
import type { FailedSession } from '@/types/api'
import { CardGridSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'

export const Route = createFileRoute('/app/generate')({
  component: GeneratePage,
})

function GeneratePage() {
  const [scheduleName, setScheduleName] = useState('')
  const [operatingHours, setOperatingHours] = useState([8, 18])
  const [selectedDays, setSelectedDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [result, setResult] = useState<null | { success: number; failed: number; failures: FailedSession[] }>(null)

  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useCourses()
  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useSessions()
  const { data: rooms = [], isLoading: roomsLoading, isError: roomsError, refetch: refetchRooms } = useRooms()
  const generateSchedule = useGenerateAndSaveSchedule()

  const isLoading = coursesLoading || sessionsLoading || roomsLoading
  const isError = coursesError || sessionsError || roomsError

  const handleRefetch = () => {
    refetchCourses()
    refetchSessions()
    refetchRooms()
  }

  const isGenerating = generateSchedule.isPending

  const days = [
    { id: 'mon', label: 'Mon', full: 'Monday' },
    { id: 'tue', label: 'Tue', full: 'Tuesday' },
    { id: 'wed', label: 'Wed', full: 'Wednesday' },
    { id: 'thu', label: 'Thu', full: 'Thursday' },
    { id: 'fri', label: 'Fri', full: 'Friday' },
    { id: 'sat', label: 'Sat', full: 'Saturday' },
    { id: 'sun', label: 'Sun', full: 'Sunday' },
  ]

  const steps = [
    'Gathering your courses...',
    'Checking room availability...',
    'Finding the best times...',
    'Arranging everything...',
    'Making final adjustments...',
    'Almost done...',
  ]

  const formatHour = (hour: number) => {
    if (hour === 12) return '12:00 PM'
    if (hour > 12) return `${hour - 12}:00 PM`
    return `${hour}:00 AM`
  }

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    )
  }

  const handleGenerate = async () => {
    setProgress(0)
    setResult(null)

    // Map day IDs to day numbers (0 = Monday, 6 = Sunday)
    const dayMap: Record<string, number> = {
      'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6
    }
    const operatingDays = selectedDays.map(d => dayMap[d]).sort()

    // Convert hours to minutes from midnight
    const operatingHoursConfig = {
      Start: operatingHours[0] * 60,
      End: operatingHours[1] * 60,
    }

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        const step = Math.floor(prev / 20)
        setCurrentStep(steps[step] || steps[steps.length - 1])
        return prev + 10
      })
    }, 200)

    generateSchedule.mutate(
      {
        name: scheduleName,
        config: {
          OperatingHours: operatingHoursConfig,
          OperatingDays: operatingDays,
        },
      },
      {
        onSuccess: (response) => {
          clearInterval(progressInterval)
          setProgress(100)
          setCurrentStep('Done!')

          const scheduledCount = response.output?.ScheduledSessions?.length || response.schedule?.sessions?.length || 0
          const failures = response.failures || response.output?.Failures || []

          setResult({
            success: scheduledCount,
            failed: failures.length,
            failures: failures,
          })
        },
        onError: () => {
          clearInterval(progressInterval)
          setProgress(0)
        },
      }
    )
  }

  const handleReset = () => {
    setScheduleName('')
    setOperatingHours([8, 18])
    setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri'])
    setResult(null)
    setProgress(0)
  }

  const resourceSummary = {
    courses: courses.length,
    sessions: sessions.length,
    rooms: rooms.length,
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create a Schedule</h1>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
        <CardGridSkeleton cards={3} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create a Schedule</h1>
          <p className="text-muted-foreground">We'll find the best times and rooms for all your classes</p>
        </div>
        <ErrorState message="Failed to load resources" onRetry={handleRefetch} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create a Schedule</h1>
          <p className="text-muted-foreground">
            We'll find the best times and rooms for all your classes
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" />
            Start Over
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-primary/10">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Name Your Schedule</CardTitle>
                  <CardDescription>Give it a name you'll recognize</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                id="name"
                placeholder="e.g., Fall 2024, Spring Term..."
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                disabled={isGenerating}
                className="text-base"
              />
            </CardContent>
          </Card>

          {/* Time Configuration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-violet-500/10">
                  <Clock className="size-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle>When Can Classes Run?</CardTitle>
                  <CardDescription>Choose your available hours and days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Operating Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Class Hours</Label>
                  <Badge variant="secondary" className="font-mono">
                    {formatHour(operatingHours[0])} - {formatHour(operatingHours[1])}
                  </Badge>
                </div>
                <Slider
                  value={operatingHours}
                  onValueChange={setOperatingHours}
                  min={6}
                  max={22}
                  step={1}
                  className="w-full"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6:00 AM</span>
                  <span className="text-center">{operatingHours[1] - operatingHours[0]} hours available</span>
                  <span>10:00 PM</span>
                </div>
              </div>

              <Separator />

              {/* Operating Days */}
              <div className="space-y-3">
                <Label>Class Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => {
                    const isSelected = selectedDays.includes(day.id)
                    return (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        disabled={isGenerating}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        } disabled:opacity-50`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedDays.length} days selected • Click to toggle
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-amber-500/10">
                  <Settings2 className="size-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Optional tweaks for better results</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox id="minimize-gaps" defaultChecked disabled={isGenerating} />
                  <div className="space-y-1">
                    <Label htmlFor="minimize-gaps" className="cursor-pointer">Keep classes close together</Label>
                    <p className="text-xs text-muted-foreground">Fewer gaps in the day</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox id="balance-rooms" defaultChecked disabled={isGenerating} />
                  <div className="space-y-1">
                    <Label htmlFor="balance-rooms" className="cursor-pointer">Spread across rooms</Label>
                    <p className="text-xs text-muted-foreground">Don't overuse any single room</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox id="prefer-morning" disabled={isGenerating} />
                  <div className="space-y-1">
                    <Label htmlFor="prefer-morning" className="cursor-pointer">Morning classes first</Label>
                    <p className="text-xs text-muted-foreground">Start earlier in the day</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox id="group-courses" disabled={isGenerating} />
                  <div className="space-y-1">
                    <Label htmlFor="group-courses" className="cursor-pointer">Keep departments together</Label>
                    <p className="text-xs text-muted-foreground">Related classes near each other</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resource Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What We're Working With</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-500" />
                  <span className="text-sm">Courses</span>
                </div>
                <Badge variant="secondary">{resourceSummary.courses}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-violet-500" />
                  <span className="text-sm">Classes to place</span>
                </div>
                <Badge variant="secondary">{resourceSummary.sessions}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <DoorOpen className="size-4 text-emerald-500" />
                  <span className="text-sm">Available rooms</span>
                </div>
                <Badge variant="secondary">{resourceSummary.rooms}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button Card */}
          <Card className={isGenerating ? 'border-primary/50' : ''}>
            <CardContent className="p-6 space-y-4">
              {!result ? (
                <>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !scheduleName || selectedDays.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Generate Schedule
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="space-y-3">
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{currentStep}</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                    </div>
                  )}

                  {!isGenerating && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <Info className="size-4 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        We'll place all your classes in rooms that fit, at times that don't overlap.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* Success Stats */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="size-8 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-500"><CountUp value={result.success} /></p>
                      <p className="text-xs text-muted-foreground">Classes placed</p>
                    </div>
                  </div>

                  {result.failed > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-500/10">
                      <XCircle className="size-8 text-rose-500" />
                      <div>
                        <p className="text-2xl font-bold text-rose-500"><CountUp value={result.failed} /></p>
                        <p className="text-xs text-muted-foreground">Couldn't fit</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                    <Zap className="size-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-blue-500">
                        <CountUp
                          value={result.success + result.failed > 0
                            ? Math.round((result.success / (result.success + result.failed)) * 100).toString()
                            : "0"}
                          suffix="%"
                        />
                      </p>
                      <p className="text-xs text-muted-foreground">Complete</p>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link to="/app/schedule">
                      See Your Schedule
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Failures Card */}
          {result && result.failures.length > 0 && (
            <Card className="border-rose-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-rose-500" />
                  <CardTitle className="text-base text-rose-500">Needs Attention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.failures.map((failure, i) => {
                  const courseName = courses.find(c => c.id === failure.CourseSession?.course_id)?.name || 'Unknown Course'
                  return (
                    <div key={i} className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <p className="text-xs font-medium">{courseName}</p>
                      <p className="text-xs text-muted-foreground">{failure.Reason}</p>
                    </div>
                  )
                })}
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleReset}>
                  <Settings2 className="mr-2 size-3" />
                  Try Different Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
