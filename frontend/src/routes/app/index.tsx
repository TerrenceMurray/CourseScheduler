import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  BookOpen,
  DoorOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
  Building2,
  Plus,
  X,
  Lightbulb,
  ChevronRight,
  Zap,
  Target,
  CalendarDays,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountUp } from '@/components/count-up'
import { Progress } from '@/components/ui/progress'
import { SetupWizard } from '@/components/setup-wizard'
import { useCourses, useRooms, useBuildings, useRoomTypes, useSchedules } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/error-state'
import { WelcomeModal } from '@/components/modals'

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const WELCOME_DISMISSED_KEY = 'course-scheduler-welcome-dismissed'

function Dashboard() {
  const [showTip, setShowTip] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  // Check if welcome modal should be shown (first visit)
  useEffect(() => {
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY)
    if (!dismissed) {
      setShowWelcome(true)
    }
  }, [])

  // Handle welcome modal dismissal
  const handleWelcomeClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
      setShowWelcome(false)
    }
  }

  const { data: courses = [], isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useCourses()
  const { data: rooms = [], isLoading: roomsLoading, isError: roomsError, refetch: refetchRooms } = useRooms()
  const { data: buildings = [], isLoading: buildingsLoading, isError: buildingsError, refetch: refetchBuildings } = useBuildings()
  const { data: roomTypes = [], isLoading: roomTypesLoading, isError: roomTypesError, refetch: refetchRoomTypes } = useRoomTypes()
  const { data: schedules = [], isLoading: schedulesLoading, isError: schedulesError, refetch: refetchSchedules } = useSchedules()

  const isLoading = coursesLoading || roomsLoading || buildingsLoading || roomTypesLoading || schedulesLoading
  const isError = coursesError || roomsError || buildingsError || roomTypesError || schedulesError

  const handleRefetch = () => {
    refetchCourses()
    refetchRooms()
    refetchBuildings()
    refetchRoomTypes()
    refetchSchedules()
  }

  // Check if setup is complete
  const isSetupComplete = buildings.length > 0 && roomTypes.length > 0 && rooms.length > 0 && courses.length > 0

  // Hide setup wizard if a schedule has been generated
  const hasSchedule = schedules.length > 0

  // Get most recent schedule
  const latestSchedule = schedules[0]
  const scheduledSessionsCount = latestSchedule?.sessions?.length || 0

  const stats = [
    {
      title: 'Courses',
      value: courses.length.toString(),
      icon: BookOpen,
      change: `${courses.length} total`,
      trend: 'up',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      href: '/app/courses',
    },
    {
      title: 'Rooms',
      value: rooms.length.toString(),
      icon: DoorOpen,
      change: `${buildings.length} buildings`,
      trend: 'neutral',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      href: '/app/rooms',
    },
    {
      title: 'Scheduled',
      value: scheduledSessionsCount.toString(),
      icon: Calendar,
      change: latestSchedule ? latestSchedule.name : 'No schedules',
      trend: 'up',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      href: '/app/schedule',
    },
    {
      title: 'Schedules',
      value: schedules.length.toString(),
      icon: CheckCircle2,
      change: schedules.length > 0 ? 'View all' : 'Generate one',
      trend: 'up',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      href: '/app/schedule',
    },
  ]

  // Transform schedules for display
  const recentSchedules = useMemo(() => {
    return schedules.slice(0, 3).map((schedule, index) => ({
      id: schedule.id,
      name: schedule.name,
      sessions: schedule.sessions?.length || 0,
      progress: 100,
      status: index === 0 ? 'active' : 'archived',
    }))
  }, [schedules])

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const colorPalette = [
    { bg: 'bg-blue-500', light: 'bg-blue-500/20', text: 'text-blue-600' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-500/20', text: 'text-emerald-600' },
    { bg: 'bg-violet-500', light: 'bg-violet-500/20', text: 'text-violet-600' },
    { bg: 'bg-amber-500', light: 'bg-amber-500/20', text: 'text-amber-600' },
    { bg: 'bg-rose-500', light: 'bg-rose-500/20', text: 'text-rose-600' },
    { bg: 'bg-cyan-500', light: 'bg-cyan-500/20', text: 'text-cyan-600' },
  ]

  // Get current day (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay()
  const currentDayIndex = today === 0 ? -1 : today - 1 // Mon = 0, Sun = -1 (not shown)
  const currentHour = new Date().getHours()

  // Build course color map
  const courseColorMap = useMemo(() => {
    const map: Record<string, typeof colorPalette[0]> = {}
    let colorIndex = 0

    if (latestSchedule?.sessions) {
      for (const session of latestSchedule.sessions) {
        if (!map[session.course_id]) {
          map[session.course_id] = colorPalette[colorIndex % colorPalette.length]
          colorIndex++
        }
      }
    }
    return map
  }, [latestSchedule])

  // Calculate dynamic hours based on session times
  const hours = useMemo(() => {
    if (!latestSchedule?.sessions?.length) {
      return [8, 9, 10, 11, 12, 13, 14, 15, 16]
    }

    let earliest = 8
    let latest = 17

    for (const session of latestSchedule.sessions) {
      const startHour = Math.floor(session.start_time / 60)
      const endHour = Math.ceil(session.end_time / 60)
      earliest = Math.min(earliest, startHour)
      latest = Math.max(latest, endHour)
    }

    // Clamp to reasonable bounds
    earliest = Math.max(5, earliest)
    latest = Math.min(22, latest)

    return Array.from({ length: latest - earliest }, (_, i) => i + earliest)
  }, [latestSchedule])

  // Transform schedule sessions to preview format
  const previewSessions = useMemo(() => {
    if (!latestSchedule?.sessions) return []

    return latestSchedule.sessions.map((session) => {
      const startHour = Math.floor(session.start_time / 60)
      const endHour = Math.ceil(session.end_time / 60)
      const course = courses.find(c => c.id === session.course_id)
      const room = rooms.find(r => r.id === session.room_id)

      // Format time for display
      const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        const period = h >= 12 ? 'PM' : 'AM'
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
        return m === 0 ? `${hour12}${period}` : `${hour12}:${m.toString().padStart(2, '0')}${period}`
      }

      return {
        dayIndex: session.day,
        startHour,
        endHour,
        duration: endHour - startHour,
        color: courseColorMap[session.course_id] || colorPalette[0],
        courseName: course?.name || 'Unknown',
        roomName: room?.name || 'Unknown',
        timeRange: `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`,
        courseId: session.course_id,
      }
    })
  }, [latestSchedule, courses, rooms, courseColorMap])

  // Get sessions for a specific cell
  const getSessionsForCell = (dayIndex: number, hour: number) => {
    return previewSessions.filter(s =>
      s.dayIndex === dayIndex &&
      hour >= s.startHour &&
      hour < s.endHour
    )
  }

  // Check if this is the first hour of a session
  const isSessionStart = (dayIndex: number, hour: number) => {
    return previewSessions.find(s => s.dayIndex === dayIndex && s.startHour === hour)
  }

  // Get unique courses for legend
  const legendCourses = useMemo(() => {
    const seen = new Set<string>()
    return previewSessions
      .filter(s => {
        if (seen.has(s.courseId)) return false
        seen.add(s.courseId)
        return true
      })
      .slice(0, 6) // Limit to 6 for space
      .map(s => ({
        name: s.courseName,
        color: s.color,
      }))
  }, [previewSessions])

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12AM'
    if (hour === 12) return '12PM'
    return hour > 12 ? `${hour - 12}PM` : `${hour}AM`
  }

  // Calculate total teaching hours from schedule
  const totalTeachingHours = useMemo(() => {
    if (!latestSchedule?.sessions) return 0
    return latestSchedule.sessions.reduce((sum, s) => sum + (s.end_time - s.start_time) / 60, 0)
  }, [latestSchedule])

  const insights = [
    { icon: Target, label: 'Sessions', value: scheduledSessionsCount.toString(), color: 'text-blue-500' },
    { icon: Zap, label: 'Rooms used', value: rooms.length.toString(), color: 'text-emerald-500' },
    { icon: Clock, label: 'Teaching hours', value: `${Math.round(totalTeachingHours)}h`, color: 'text-violet-500' },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="size-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Weekly Preview Skeleton */}
          <Card className="lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-8 w-28" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4 pb-4 border-b">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-1.5">
                    <Skeleton className="h-7 w-full" />
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-7 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-28 mb-1" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-7 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Stats Row Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-6">
                <Skeleton className="size-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground">Here's an overview of your scheduling system.</p>
        </div>
        <ErrorState message="Failed to load dashboard data" onRetry={handleRefetch} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your scheduling system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/courses">
              <Plus className="mr-2 size-4" />
              Add Course
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/generate">
              <Sparkles className="mr-2 size-4" />
              Generate Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Setup Wizard - Only show if no schedule generated yet */}
      {!hasSchedule && (
        <SetupWizard
          buildingsCount={buildings.length}
          roomTypesCount={roomTypes.length}
          roomsCount={rooms.length}
          coursesCount={courses.length}
        />
      )}

      {/* Tip Banner - Only show when setup is complete or has schedule */}
      {(isSetupComplete || hasSchedule) && showTip && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-violet-500/5 border border-primary/10">
          <div className="rounded-full bg-primary/10 p-2">
            <Lightbulb className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Quick Tip</p>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono mx-0.5">⌘K</kbd> to quickly navigate between pages.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setShowTip(false)}>
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-stagger">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.iconBg} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`size-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  <CountUp value={stat.value} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {stat.trend === 'up' && <TrendingUp className="size-3 text-emerald-500" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Weekly Preview - Larger */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Your current timetable at a glance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/app/schedule">
                Full schedule
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* Insights Row */}
            <div className="flex gap-4 mb-4 pb-4 border-b">
              {insights.map((insight) => (
                <div key={insight.label} className="flex items-center gap-2">
                  <insight.icon className={`size-4 ${insight.color}`} />
                  <span className="text-xs text-muted-foreground">{insight.label}:</span>
                  <span className="text-sm font-medium">{insight.value}</span>
                </div>
              ))}
            </div>

            {previewSessions.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CalendarDays className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No Schedule Yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
                  Generate a schedule to see your weekly timetable here.
                </p>
                <Button size="sm" asChild>
                  <Link to="/app/generate">
                    <Sparkles className="mr-2 size-4" />
                    Generate Schedule
                  </Link>
                </Button>
              </div>
            ) : (
              <TooltipProvider delayDuration={100}>
                {/* Day Headers */}
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  <div />
                  {days.map((day, dayIndex) => (
                    <div
                      key={day}
                      className={`text-xs font-medium text-center py-1 rounded ${
                        dayIndex === currentDayIndex
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {day}
                      {dayIndex === currentDayIndex && (
                        <span className="block text-[10px] font-normal">Today</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="space-y-1">
                  {hours.map((hour) => {
                    const isCurrentHour = currentDayIndex >= 0 && hour === currentHour
                    return (
                      <div key={hour} className="grid grid-cols-6 gap-1.5 relative">
                        {/* Current time indicator */}
                        {isCurrentHour && (
                          <div
                            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
                            style={{ top: '50%' }}
                          />
                        )}
                        <div className={`text-xs text-right pr-2 flex items-center justify-end ${
                          isCurrentHour ? 'text-red-500 font-medium' : 'text-muted-foreground'
                        }`}>
                          {formatHour(hour)}
                        </div>
                        {days.map((day, dayIndex) => {
                          const cellSessions = getSessionsForCell(dayIndex, hour)
                          const startingSession = isSessionStart(dayIndex, hour)
                          const isToday = dayIndex === currentDayIndex
                          const isNow = isToday && hour === currentHour

                          if (cellSessions.length === 0) {
                            return (
                              <div
                                key={`${day}-${hour}`}
                                className={`h-7 rounded-md transition-all ${
                                  isToday
                                    ? 'bg-primary/5 hover:bg-primary/10'
                                    : 'bg-muted/40 hover:bg-muted/60'
                                } ${isNow ? 'ring-1 ring-red-500/50' : ''}`}
                              />
                            )
                          }

                          const session = cellSessions[0]
                          const isStart = startingSession?.courseId === session.courseId

                          return (
                            <Tooltip key={`${day}-${hour}`}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-7 rounded-md transition-all cursor-pointer hover:opacity-90 hover:scale-[1.02] ${session.color.bg} ${
                                    isStart ? 'flex items-center justify-center overflow-hidden' : ''
                                  } ${isNow ? 'ring-2 ring-red-500' : ''}`}
                                >
                                  {isStart && (
                                    <span className="text-[10px] font-medium text-white truncate px-1">
                                      {session.courseName.length > 8
                                        ? session.courseName.substring(0, 8) + '…'
                                        : session.courseName}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px]">
                                <div className="space-y-1">
                                  <p className="font-medium">{session.courseName}</p>
                                  <p className="text-xs text-muted-foreground">{session.timeRange}</p>
                                  <p className="text-xs text-muted-foreground">{session.roomName}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>

                {/* Dynamic Legend */}
                {legendCourses.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                    {legendCourses.map((course) => (
                      <div key={course.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className={`size-2.5 rounded ${course.color.bg}`} />
                        <span className="truncate max-w-[100px]">{course.name}</span>
                      </div>
                    ))}
                    {previewSessions.length > legendCourses.length && (
                      <span className="text-xs text-muted-foreground">
                        +{new Set(previewSessions.map(s => s.courseId)).size - legendCourses.length} more
                      </span>
                    )}
                  </div>
                )}
              </TooltipProvider>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Schedules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Schedules</CardTitle>
              <CardDescription>Recent and active schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSchedules.map((schedule) => (
                <Link key={schedule.id} to="/app/schedule">
                  <div className="group p-3 -mx-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${
                          schedule.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                        }`} />
                        <span className="text-sm font-medium">{schedule.name}</span>
                      </div>
                      <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {schedule.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{schedule.sessions} classes</span>
                      <span>{schedule.progress}% complete</span>
                    </div>
                    <Progress value={schedule.progress} className="h-1.5" />
                  </div>
                </Link>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm" asChild>
                <Link to="/app/schedule">
                  View All
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-1.5 bg-blue-500/10">
                  <BookOpen className="size-3.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1">Courses</p>
                  <p className="text-xs text-muted-foreground truncate">{courses.length} total courses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-1.5 bg-emerald-500/10">
                  <DoorOpen className="size-3.5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1">Rooms</p>
                  <p className="text-xs text-muted-foreground truncate">{rooms.length} available rooms</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-1.5 bg-amber-500/10">
                  <Building2 className="size-3.5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1">Buildings</p>
                  <p className="text-xs text-muted-foreground truncate">{buildings.length} campus buildings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-1.5 bg-violet-500/10">
                  <Sparkles className="size-3.5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-1">Schedules</p>
                  <p className="text-xs text-muted-foreground truncate">{schedules.length} generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/app/buildings">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-3 transition-transform group-hover:scale-110">
                <Building2 className="size-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold"><CountUp value={buildings.length.toString()} /></p>
                <p className="text-sm text-muted-foreground">Buildings</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/schedule">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 p-3 transition-transform group-hover:scale-110">
                <Clock className="size-6 text-violet-500" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold"><CountUp value={Math.round(totalTeachingHours).toString()} suffix="h" /></p>
                <p className="text-sm text-muted-foreground">Teaching Hours</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/rooms">
          <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-3 transition-transform group-hover:scale-110">
                <TrendingUp className="size-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold"><CountUp value={rooms.reduce((sum, r) => sum + r.capacity, 0).toString()} /></p>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Welcome Modal - Shows on first visit */}
      <WelcomeModal open={showWelcome} onOpenChange={handleWelcomeClose} />
    </div>
  )
}
