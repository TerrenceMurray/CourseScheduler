import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountUp } from '@/components/count-up'
import { Progress } from '@/components/ui/progress'
import { useCourses, useRooms, useBuildings, useSchedules } from '@/hooks'

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  const [showTip, setShowTip] = useState(true)

  const { data: courses = [] } = useCourses()
  const { data: rooms = [] } = useRooms()
  const { data: buildings = [] } = useBuildings()
  const { data: schedules = [] } = useSchedules()

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
  const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM']
  const colorPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

  // Transform schedule sessions to preview format
  const previewSessions = useMemo(() => {
    if (!latestSchedule?.sessions) return []

    const courseColorMap: Record<string, string> = {}
    let colorIndex = 0

    return latestSchedule.sessions.map((session) => {
      if (!courseColorMap[session.course_id]) {
        courseColorMap[session.course_id] = colorPalette[colorIndex % colorPalette.length]
        colorIndex++
      }

      const startHour = Math.floor(session.start_time / 60)
      const hourStr = startHour >= 12
        ? `${startHour === 12 ? 12 : startHour - 12}PM`
        : `${startHour}AM`

      const course = courses.find(c => c.id === session.course_id)

      return {
        day: days[session.day] || 'Mon',
        hour: hourStr,
        color: courseColorMap[session.course_id],
        name: course?.name || 'Unknown',
      }
    })
  }, [latestSchedule, courses])

  const hasSession = (day: string, hour: string) => {
    return previewSessions.find(s => s.day === day && s.hour === hour)
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

      {/* Tip Banner */}
      {showTip && (
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
            {/* Day Headers */}
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              <div />
              {days.map((day) => (
                <div key={day} className="text-xs font-medium text-center text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            {/* Time Grid */}
            <div className="space-y-1.5">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-6 gap-1.5">
                  <div className="text-xs text-muted-foreground text-right pr-2 flex items-center justify-end">
                    {hour}
                  </div>
                  {days.map((day) => {
                    const session = hasSession(day, hour)
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className={`h-6 rounded-md transition-all ${
                          session
                            ? `${session.color} cursor-pointer hover:opacity-80 hover:scale-105`
                            : 'bg-muted/40 hover:bg-muted/60'
                        }`}
                        title={session ? `${session.name} - ${day} ${hour}` : undefined}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded bg-blue-500" />
                <span>Computer Science</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded bg-emerald-500" />
                <span>Mathematics</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded bg-violet-500" />
                <span>Data Structures</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-3 rounded bg-amber-500" />
                <span>Physics</span>
              </div>
            </div>
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
    </div>
  )
}
