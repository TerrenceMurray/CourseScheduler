import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  DoorOpen,
  Users,
  CheckCircle2,
  Printer,
  FileDown,
  MapPin,
  Building2,
  EyeOff,
  Sparkles,
  CalendarDays,
  Archive,
  ArchiveRestore,
  MoreVertical,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { CountUp } from '@/components/count-up'
import { useSchedules, useCourses, useRooms, useBuildings, useSetActiveSchedule, useArchiveSchedule, useArchivedSchedules, useUnarchiveSchedule } from '@/hooks'
import { CardListSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/schedule')({
  component: SchedulePage,
})

type Session = {
  id: string
  course: string
  courseName: string
  room: string
  building: string
  day: string
  dayIndex: number
  startHour: number
  duration: number
  color: string
  capacity: number
}

function SchedulePage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')
  const [hiddenCourses, setHiddenCourses] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: schedules = [], isLoading: schedulesLoading, isError: schedulesError, refetch: refetchSchedules } = useSchedules()
  const { data: archivedSchedules = [] } = useArchivedSchedules()
  const { data: courses = [] } = useCourses()
  const { data: rooms = [] } = useRooms()
  const { data: buildings = [] } = useBuildings()

  const setActiveMutation = useSetActiveSchedule()
  const archiveMutation = useArchiveSchedule()
  const unarchiveMutation = useUnarchiveSchedule()

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Get current day and hour for highlighting
  const currentDayIndex = currentTime.getDay() - 1 // 0 = Monday
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60

  // Color palette for courses
  const colorPalette = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'indigo', 'pink', 'teal', 'orange']

  // Create lookup maps
  const courseMap = useMemo(() => {
    return courses.reduce((acc, course) => {
      acc[course.id] = course
      return acc
    }, {} as Record<string, typeof courses[0]>)
  }, [courses])

  const roomMap = useMemo(() => {
    return rooms.reduce((acc, room) => {
      acc[room.id] = room
      return acc
    }, {} as Record<string, typeof rooms[0]>)
  }, [rooms])

  const buildingMap = useMemo(() => {
    return buildings.reduce((acc, building) => {
      acc[building.id] = building
      return acc
    }, {} as Record<string, typeof buildings[0]>)
  }, [buildings])

  // Get current schedule
  const currentSchedule = useMemo(() => {
    if (selectedScheduleId) {
      return schedules.find(s => s.id === selectedScheduleId)
    }
    return schedules[0]
  }, [schedules, selectedScheduleId])

  // Transform scheduled sessions to UI format
  const sessions: Session[] = useMemo(() => {
    if (!currentSchedule?.sessions) return []

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const courseColorMap: Record<string, string> = {}
    let colorIndex = 0

    return currentSchedule.sessions.map((session, index) => {
      const course = courseMap[session.course_id]
      const room = roomMap[session.room_id]
      const building = room ? buildingMap[room.building_id] : undefined

      // Assign consistent color per course
      if (session.course_id && !courseColorMap[session.course_id]) {
        courseColorMap[session.course_id] = colorPalette[colorIndex % colorPalette.length]
        colorIndex++
      }

      // Convert minutes from midnight to hours
      const startHour = session.start_time / 60
      const duration = (session.end_time - session.start_time) / 60

      return {
        id: `${session.course_id}-${session.room_id}-${session.day}-${index}`,
        course: course?.name || 'Unknown Course',
        courseName: course?.name || 'Unknown Course',
        room: room?.name || 'Unknown Room',
        building: building?.name || 'Unknown Building',
        day: dayNames[session.day] || 'Unknown',
        dayIndex: session.day,
        startHour,
        duration,
        color: courseColorMap[session.course_id] || 'blue',
        capacity: room?.capacity || 0,
      }
    })
  }, [currentSchedule, courseMap, roomMap, buildingMap])

  // Filter visible sessions
  const visibleSessions = useMemo(() => {
    return sessions.filter(s => !hiddenCourses.has(s.course))
  }, [sessions, hiddenCourses])

  // Calculate dynamic grid hours based on session times
  const { gridStartHour, gridEndHour, hours } = useMemo(() => {
    if (sessions.length === 0) {
      return { gridStartHour: 8, gridEndHour: 20, hours: Array.from({ length: 12 }, (_, i) => i + 8) }
    }

    // Find earliest start and latest end across all sessions
    let earliest = 8
    let latest = 20

    for (const session of sessions) {
      const sessionEnd = session.startHour + session.duration
      earliest = Math.min(earliest, Math.floor(session.startHour))
      latest = Math.max(latest, Math.ceil(sessionEnd))
    }

    // Ensure reasonable bounds (5 AM to 11 PM)
    earliest = Math.max(5, earliest)
    latest = Math.min(23, latest)

    const hours = Array.from({ length: latest - earliest }, (_, i) => i + earliest)
    return { gridStartHour: earliest, gridEndHour: latest, hours }
  }, [sessions])

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleCourseVisibility = (courseName: string) => {
    setHiddenCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseName)) {
        newSet.delete(courseName)
      } else {
        newSet.add(courseName)
      }
      return newSet
    })
  }

  const uniqueCourses = [...new Set(sessions.map(s => s.course))]
  const uniqueRooms = [...new Set(sessions.map(s => s.room))]
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0)

  const stats = [
    { title: 'Classes/Week', value: sessions.length.toString(), icon: Calendar, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { title: 'Courses', value: uniqueCourses.length.toString(), icon: BookOpen, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
    { title: 'Rooms Used', value: uniqueRooms.length.toString(), icon: DoorOpen, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { title: 'Total Hours', value: `${totalHours}h`, icon: Clock, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  ]

  if (schedulesLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Timetable</h1>
            <p className="text-muted-foreground">See when and where classes happen</p>
          </div>
        </div>
        <CardListSkeleton cards={4} />
      </div>
    )
  }

  if (schedulesError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Timetable</h1>
          <p className="text-muted-foreground">See when and where classes happen</p>
        </div>
        <ErrorState message="Failed to load schedules" onRetry={() => refetchSchedules()} />
      </div>
    )
  }

  const formatHour = (hour: number) => {
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return m === 0 ? `${displayHour} ${suffix}` : `${displayHour}:${m.toString().padStart(2, '0')} ${suffix}`
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; solid: string }> = {
      blue: { bg: 'bg-blue-500/15', border: 'border-l-blue-500', text: 'text-blue-500', solid: 'bg-blue-500' },
      emerald: { bg: 'bg-emerald-500/15', border: 'border-l-emerald-500', text: 'text-emerald-500', solid: 'bg-emerald-500' },
      violet: { bg: 'bg-violet-500/15', border: 'border-l-violet-500', text: 'text-violet-500', solid: 'bg-violet-500' },
      amber: { bg: 'bg-amber-500/15', border: 'border-l-amber-500', text: 'text-amber-500', solid: 'bg-amber-500' },
      rose: { bg: 'bg-rose-500/15', border: 'border-l-rose-500', text: 'text-rose-500', solid: 'bg-rose-500' },
      cyan: { bg: 'bg-cyan-500/15', border: 'border-l-cyan-500', text: 'text-cyan-500', solid: 'bg-cyan-500' },
      indigo: { bg: 'bg-indigo-500/15', border: 'border-l-indigo-500', text: 'text-indigo-500', solid: 'bg-indigo-500' },
      pink: { bg: 'bg-pink-500/15', border: 'border-l-pink-500', text: 'text-pink-500', solid: 'bg-pink-500' },
      teal: { bg: 'bg-teal-500/15', border: 'border-l-teal-500', text: 'text-teal-500', solid: 'bg-teal-500' },
      orange: { bg: 'bg-orange-500/15', border: 'border-l-orange-500', text: 'text-orange-500', solid: 'bg-orange-500' },
    }
    return colors[color] || colors.blue
  }

  // Calculate overlapping sessions and their positions
  const getSessionsWithLayout = (daySessions: Session[]) => {
    if (daySessions.length === 0) return []
    if (daySessions.length === 1) {
      return [{ session: daySessions[0], column: 0, totalColumns: 1 }]
    }

    // Sort by start time, then by duration (longer first)
    const sorted = [...daySessions].sort((a, b) => {
      if (a.startHour !== b.startHour) return a.startHour - b.startHour
      return b.duration - a.duration
    })

    // Helper to check if two sessions overlap (inclusive of same start time)
    const overlaps = (s1: Session, s2: Session): boolean => {
      if (s1.id === s2.id) return false // Don't count self
      const s1Start = s1.startHour
      const s1End = s1.startHour + s1.duration
      const s2Start = s2.startHour
      const s2End = s2.startHour + s2.duration
      // Two intervals overlap if one starts before the other ends
      return s1Start < s2End && s2Start < s1End
    }

    // Build adjacency: for each session, find all overlapping sessions
    const overlapGroups: Map<string, Set<string>> = new Map()
    for (const s of sorted) {
      overlapGroups.set(s.id, new Set())
    }

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (overlaps(sorted[i], sorted[j])) {
          overlapGroups.get(sorted[i].id)!.add(sorted[j].id)
          overlapGroups.get(sorted[j].id)!.add(sorted[i].id)
        }
      }
    }

    // Greedy graph coloring for column assignment
    const sessionToColumn: Map<string, number> = new Map()

    for (const session of sorted) {
      // Find columns used by overlapping sessions
      const usedColumns = new Set<number>()
      const overlappingIds = overlapGroups.get(session.id) || new Set()

      for (const otherId of overlappingIds) {
        const col = sessionToColumn.get(otherId)
        if (col !== undefined) {
          usedColumns.add(col)
        }
      }

      // Find first available column
      let column = 0
      while (usedColumns.has(column)) {
        column++
      }

      sessionToColumn.set(session.id, column)
    }

    // Calculate total columns for each session based on its overlap group
    const sessionLayouts: { session: Session; column: number; totalColumns: number }[] = []

    for (const session of sorted) {
      const column = sessionToColumn.get(session.id) ?? 0
      const overlappingIds = overlapGroups.get(session.id) || new Set()

      // Get all columns used in this overlap group (including self)
      const columnsInGroup = new Set<number>([column])
      for (const otherId of overlappingIds) {
        columnsInGroup.add(sessionToColumn.get(otherId) ?? 0)
      }

      sessionLayouts.push({
        session,
        column,
        totalColumns: columnsInGroup.size
      })
    }

    return sessionLayouts
  }

  // Check if a session is currently happening
  const isSessionNow = (session: Session) => {
    if (session.dayIndex !== currentDayIndex) return false
    return currentHour >= session.startHour && currentHour < session.startHour + session.duration
  }

  // Get next session
  const getNextSession = () => {
    const now = currentDayIndex * 24 + currentHour
    let nextSession: Session | null = null
    let nextTime = Infinity

    for (const session of sessions) {
      const sessionTime = session.dayIndex * 24 + session.startHour
      if (sessionTime > now && sessionTime < nextTime) {
        nextTime = sessionTime
        nextSession = session
      }
    }
    return nextSession
  }

  const nextSession = getNextSession()
  const currentSession = sessions.find(s => isSessionNow(s))

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Your Timetable</h1>
              {currentSchedule?.is_active && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  <Star className="mr-1 size-3 fill-amber-500" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              See when and where classes happen
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={currentSchedule?.id || ''}
              onValueChange={setSelectedScheduleId}
            >
              <SelectTrigger className="w-52">
                <Calendar className="mr-2 size-4" />
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {schedules.length === 0 ? (
                  <SelectItem value="none" disabled>No schedules available</SelectItem>
                ) : (
                  schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      <span className="flex items-center gap-2">
                        {schedule.is_active && <Star className="size-3 fill-amber-500 text-amber-500" />}
                        {schedule.name}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Schedule Actions */}
            {currentSchedule && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!currentSchedule.is_active && (
                    <DropdownMenuItem
                      onClick={() => setActiveMutation.mutate(currentSchedule.id)}
                      className="cursor-pointer"
                      disabled={setActiveMutation.isPending}
                    >
                      <Star className="mr-2 size-4" />
                      Set as Active
                    </DropdownMenuItem>
                  )}
                  {currentSchedule.is_active && (
                    <DropdownMenuItem disabled className="cursor-not-allowed text-muted-foreground">
                      <Star className="mr-2 size-4 fill-amber-500 text-amber-500" />
                      Active Schedule
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => archiveMutation.mutate(currentSchedule.id)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    disabled={archiveMutation.isPending}
                  >
                    <Archive className="mr-2 size-4" />
                    Archive Schedule
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Archived Schedules */}
            {archivedSchedules.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="mr-2 size-4" />
                    Archived ({archivedSchedules.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {archivedSchedules.map((schedule) => (
                    <DropdownMenuItem
                      key={schedule.id}
                      onClick={() => unarchiveMutation.mutate(schedule.id)}
                      className="cursor-pointer"
                      disabled={unarchiveMutation.isPending}
                    >
                      <ArchiveRestore className="mr-2 size-4" />
                      <span className="truncate">{schedule.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
                  <FileDown className="mr-2 size-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('ics')} className="cursor-pointer">
                  <Calendar className="mr-2 size-4" />
                  Export as Calendar (.ics)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
                  <FileDown className="mr-2 size-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
                  <Printer className="mr-2 size-4" />
                  Print Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Empty State */}
        {schedules.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CalendarDays className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Generate a schedule from the Generate page to see your timetable here with all your classes organized.
              </p>
              <Button variant="outline" asChild>
                <a href="/app/generate">
                  <Sparkles className="mr-2 size-4" />
                  Generate Schedule
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current/Next Session Banner */}
        {(currentSession || nextSession) && (
          <Card className={cn(
            "border-l-4 transition-colors",
            currentSession ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-blue-500 bg-blue-500/5"
          )}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "rounded-full p-2.5",
                    currentSession ? "bg-emerald-500/10" : "bg-blue-500/10"
                  )}>
                    {currentSession ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : (
                      <Clock className="size-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        currentSession ? "text-emerald-500" : "text-blue-500"
                      )}>
                        {currentSession ? "Happening Now" : "Up Next"}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {currentSession?.course || nextSession?.course}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentSession ? (
                        <>
                          {currentSession.room} • Ends at {formatHour(currentSession.startHour + currentSession.duration)}
                        </>
                      ) : nextSession && (
                        <>
                          {nextSession.day} at {formatHour(nextSession.startHour)} • {nextSession.room}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(currentSession || nextSession)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 animate-stagger">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                    <stat.icon className={`size-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold"><CountUp value={stat.value} /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Course Legend/Filter */}
        {uniqueCourses.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHiddenCourses(new Set())}
                  className="text-xs h-7"
                >
                  Show All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {uniqueCourses.map((courseName) => {
                  const session = sessions.find(s => s.course === courseName)
                  const colors = getColorClasses(session?.color || 'blue')
                  const isHidden = hiddenCourses.has(courseName)
                  const courseSessionCount = sessions.filter(s => s.course === courseName).length

                  return (
                    <Tooltip key={courseName}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleCourseVisibility(courseName)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            isHidden
                              ? "bg-muted text-muted-foreground opacity-50"
                              : `${colors.bg} ${colors.text}`
                          )}
                        >
                          <span className={cn(
                            "size-2 rounded-full",
                            isHidden ? "bg-muted-foreground" : colors.solid
                          )} />
                          <span className="truncate max-w-32">{courseName}</span>
                          {isHidden ? (
                            <EyeOff className="size-3" />
                          ) : (
                            <span className="text-xs opacity-70">{courseSessionCount}x</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isHidden ? 'Click to show' : 'Click to hide'} {courseName}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Tabs */}
        {sessions.length > 0 && (
          <Tabs defaultValue="week" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="week">Week View</TabsTrigger>
                <TabsTrigger value="room">By Room</TabsTrigger>
                <TabsTrigger value="course">By Course</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-8">
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="sm">Today</Button>
                <Button variant="outline" size="icon" className="size-8">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Week View */}
            <TabsContent value="week">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Weekly Schedule</CardTitle>
                      <CardDescription>
                        {visibleSessions.length} of {sessions.length} sessions visible
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <CheckCircle2 className="mr-1 size-3" />
                      No Conflicts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
                    <div className="min-w-[800px]">
                      {/* Day Headers */}
                      <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b sticky top-0 bg-background z-30">
                        <div className="p-3 text-xs font-medium text-muted-foreground flex items-center justify-center">
                          <Clock className="size-4" />
                        </div>
                        {days.map((day, i) => {
                          const isToday = i === currentDayIndex
                          return (
                            <div
                              key={day}
                              className={cn(
                                "p-3 text-center border-l transition-colors",
                                isToday && "bg-primary/5"
                              )}
                            >
                              <div className={cn(
                                "text-sm font-medium",
                                isToday && "text-primary"
                              )}>
                                {day}
                              </div>
                              {isToday && (
                                <Badge variant="secondary" className="mt-1 text-xs">Today</Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Time Grid */}
                      <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
                        {/* Time Labels */}
                        <div className="border-r">
                          {hours.map((hour) => (
                            <div key={hour} className="h-15 border-b px-3 py-1">
                              <span className="text-xs text-muted-foreground">{formatHour(hour)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Day Columns */}
                        {days.map((day, dayIdx) => {
                          // Filter to sessions for this day that are visible in the grid
                          const daySessions = visibleSessions.filter((s) => {
                            if (s.day !== day) return false
                            const sessionEnd = s.startHour + s.duration
                            // Include sessions that overlap with the visible grid
                            return sessionEnd > gridStartHour && s.startHour < gridEndHour
                          })
                          const sessionsWithLayout = getSessionsWithLayout(daySessions)
                          const isToday = dayIdx === currentDayIndex

                          return (
                            <div
                              key={day}
                              className={cn(
                                "relative border-l overflow-visible",
                                isToday && "bg-primary/5"
                              )}
                              style={{ height: `${hours.length * 60}px` }}
                            >
                              {/* Hour lines */}
                              {hours.map((hour) => (
                                <div
                                  key={hour}
                                  className="absolute w-full border-b border-dashed border-muted/50"
                                  style={{ top: `${(hour - 8) * 60}px`, height: '60px' }}
                                />
                              ))}

                              {/* Current time indicator */}
                              {isToday && currentHour >= 8 && currentHour <= 20 && (
                                <div
                                  className="absolute w-full z-20 pointer-events-none"
                                  style={{ top: `${(currentHour - 8) * 60}px` }}
                                >
                                  <div className="relative">
                                    <div className="absolute -left-1 -top-1.5 size-3 rounded-full bg-red-500" />
                                    <div className="h-0.5 bg-red-500" />
                                  </div>
                                </div>
                              )}

                              {/* Sessions */}
                              {sessionsWithLayout.map(({ session, column, totalColumns }) => {
                                const colors = getColorClasses(session.color)
                                // Calculate width and position as percentages
                                const padding = 4 // px padding on sides
                                const gapBetween = 2 // px gap between overlapping sessions
                                // Width per column in percentage
                                const widthPercent = (100 / totalColumns)
                                const isNow = isSessionNow(session)

                                // Clip session to visible grid area
                                const sessionEndHour = session.startHour + session.duration
                                const visibleStartHour = Math.max(session.startHour, gridStartHour)
                                const visibleEndHour = Math.min(sessionEndHour, gridEndHour)
                                const visibleDuration = visibleEndHour - visibleStartHour

                                const top = (visibleStartHour - gridStartHour) * 60
                                const height = Math.max(40, visibleDuration * 60)

                                return (
                                  <Tooltip key={session.id}>
                                    <TooltipTrigger asChild>
                                      <div
                                        onClick={() => setSelectedSession(session)}
                                        className={cn(
                                          "absolute rounded-md border-l-[3px] px-1.5 py-1 cursor-pointer transition-all overflow-hidden shadow-sm",
                                          "hover:shadow-md hover:z-10 hover:brightness-95",
                                          colors.bg,
                                          colors.border,
                                          isNow && "ring-2 ring-emerald-500 ring-offset-1"
                                        )}
                                        style={{
                                          top: `${top + 1}px`,
                                          height: `${height - 4}px`,
                                          width: `calc(${widthPercent}% - ${padding + gapBetween}px)`,
                                          left: `calc(${column * widthPercent}% + ${padding / 2 + (column > 0 ? gapBetween / 2 : 0)}px)`,
                                          zIndex: column + 1,
                                        }}
                                      >
                                        <div className={cn("text-[11px] font-semibold truncate leading-tight", colors.text)}>
                                          {session.course}
                                        </div>
                                        {visibleDuration >= 0.75 && height >= 50 && (
                                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                                            <DoorOpen className="size-2.5 shrink-0" />
                                            <span className="truncate">{session.room}</span>
                                          </div>
                                        )}
                                        {visibleDuration >= 1.5 && height >= 70 && (
                                          <div className="text-[9px] text-muted-foreground mt-0.5">
                                            {formatHour(session.startHour)} - {formatHour(session.startHour + session.duration)}
                                          </div>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-semibold">{session.course}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatHour(session.startHour)} - {formatHour(session.startHour + session.duration)} ({formatDuration(session.duration)})
                                        </p>
                                        <p className="text-xs">
                                          <span className="text-muted-foreground">Room:</span> {session.room}
                                        </p>
                                        <p className="text-xs">
                                          <span className="text-muted-foreground">Building:</span> {session.building}
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* By Room View */}
            <TabsContent value="room">
              <div className="grid gap-4 md:grid-cols-2">
                {[...new Set(visibleSessions.map(s => s.room))].map((room) => {
                  const roomSessions = visibleSessions.filter(s => s.room === room)
                  const firstSession = roomSessions[0]
                  const totalRoomHours = roomSessions.reduce((sum, s) => sum + s.duration, 0)

                  return (
                    <Card key={room} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg p-2.5 bg-primary/10">
                            <DoorOpen className="size-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base leading-none">{room}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1">
                              <Building2 className="size-3" />
                              {firstSession?.building || 'Unknown Building'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{roomSessions.length} sessions</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{totalRoomHours}h/week</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-72 overflow-y-auto">
                          {roomSessions
                            .sort((a, b) => a.dayIndex - b.dayIndex || a.startHour - b.startHour)
                            .map((session, index) => {
                              const colors = getColorClasses(session.color)
                              const isNow = isSessionNow(session)
                              return (
                                <div
                                  key={session.id}
                                  onClick={() => setSelectedSession(session)}
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer",
                                    index > 0 && "border-t",
                                    isNow && "bg-emerald-500/5"
                                  )}
                                >
                                  <div className={cn("w-1 h-10 rounded-full", colors.solid)} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={cn("text-sm font-semibold", colors.text)}>{session.course}</span>
                                      {isNow && (
                                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">Now</Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {session.day} • {formatHour(session.startHour)} - {formatHour(session.startHour + session.duration)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    {formatDuration(session.duration)}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* By Course View */}
            <TabsContent value="course">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {uniqueCourses.filter(c => !hiddenCourses.has(c)).map((courseName) => {
                  const courseSessions = visibleSessions.filter(s => s.course === courseName)
                  const firstSession = courseSessions[0]
                  const colors = getColorClasses(firstSession.color)
                  const totalCourseHours = courseSessions.reduce((sum, s) => sum + s.duration, 0)
                  const uniqueRoomsForCourse = [...new Set(courseSessions.map(s => s.room))]

                  return (
                    <Card key={courseName} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-3 border-b", colors.bg)}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-1 h-12 rounded-full", colors.solid)} />
                          <div>
                            <CardTitle className={cn("text-base leading-none", colors.text)}>{courseName}</CardTitle>
                            <CardDescription className="mt-1">
                              {uniqueRoomsForCourse.length} room{uniqueRoomsForCourse.length > 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{courseSessions.length}x/week</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{totalCourseHours}h total</p>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div>
                          {courseSessions
                            .sort((a, b) => a.dayIndex - b.dayIndex || a.startHour - b.startHour)
                            .map((session, index) => {
                              const isNow = isSessionNow(session)
                              return (
                                <div
                                  key={session.id}
                                  onClick={() => setSelectedSession(session)}
                                  className={cn(
                                    "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer",
                                    index > 0 && "border-t",
                                    isNow && "bg-emerald-500/5"
                                  )}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{session.day}</span>
                                      {isNow && (
                                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">Now</Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {formatHour(session.startHour)} - {formatHour(session.startHour + session.duration)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline" className="mb-1">
                                      <DoorOpen className="mr-1 size-3" />
                                      {session.room}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                      <Users className="size-3" />
                                      {session.capacity} seats
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Session Details Modal */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="sm:max-w-md">
            {selectedSession && (() => {
              const colors = getColorClasses(selectedSession.color)
              const isNow = isSessionNow(selectedSession)
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-1 h-12 rounded-full", colors.solid)} />
                      <div>
                        <DialogTitle className={colors.text}>
                          {selectedSession.course}
                        </DialogTitle>
                        <DialogDescription>
                          {formatDuration(selectedSession.duration)} session
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  {isNow && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                      <span className="text-sm font-medium">Happening Now</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Day & Time</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          {selectedSession.day}
                        </p>
                        <p className="text-sm text-muted-foreground pl-6">
                          {formatHour(selectedSession.startHour)} - {formatHour(selectedSession.startHour + selectedSession.duration)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          {formatDuration(selectedSession.duration)}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="rounded-lg p-2 bg-primary/10">
                          <DoorOpen className="size-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{selectedSession.room}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3" />
                            {selectedSession.building}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="size-3" />
                            {selectedSession.capacity} seats capacity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
