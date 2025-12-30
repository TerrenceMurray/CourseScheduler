import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  BookOpen,
  DoorOpen,
  Users,
  CheckCircle2,
  Printer,
  FileDown,
  MapPin,
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
import { Separator } from '@/components/ui/separator'
import { CountUp } from '@/components/count-up'
import { useSchedules, useCourses, useRooms, useBuildings } from '@/hooks'
import { CardListSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'

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
  startHour: number
  duration: number
  color: string
  capacity: number
}

function SchedulePage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')

  const { data: schedules = [], isLoading: schedulesLoading, isError: schedulesError, refetch: refetchSchedules } = useSchedules()
  const { data: courses = [] } = useCourses()
  const { data: rooms = [] } = useRooms()
  const { data: buildings = [] } = useBuildings()

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8AM to 7PM

  // Color palette for courses
  const colorPalette = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan']

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
        startHour,
        duration,
        color: courseColorMap[session.course_id] || 'blue',
        capacity: room?.capacity || 0,
      }
    })
  }, [currentSchedule, courseMap, roomMap, buildingMap])

  const handleExport = (format: string) => {
    // In a real app, this would trigger actual export
    console.log(`Exporting as ${format}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const uniqueCourses = [...new Set(sessions.map(s => s.course))]
  const uniqueRooms = [...new Set(sessions.map(s => s.room))]
  const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)

  const stats = [
    { title: 'Classes', value: sessions.length.toString(), icon: Calendar, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { title: 'Courses', value: uniqueCourses.length.toString(), icon: BookOpen, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
    { title: 'Rooms', value: uniqueRooms.length.toString(), icon: DoorOpen, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { title: 'Total Capacity', value: totalCapacity.toString(), icon: Users, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
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

  const getSessionStyle = (startHour: number, duration: number) => {
    const top = (startHour - 8) * 60
    const height = duration * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-500/20', border: 'border-l-blue-500', text: 'text-blue-400' },
      emerald: { bg: 'bg-emerald-500/20', border: 'border-l-emerald-500', text: 'text-emerald-400' },
      violet: { bg: 'bg-violet-500/20', border: 'border-l-violet-500', text: 'text-violet-400' },
      amber: { bg: 'bg-amber-500/20', border: 'border-l-amber-500', text: 'text-amber-400' },
      rose: { bg: 'bg-rose-500/20', border: 'border-l-rose-500', text: 'text-rose-400' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-l-cyan-500', text: 'text-cyan-400' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Timetable</h1>
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
                    {schedule.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
          <Calendar className="size-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">No schedules yet</p>
            <p className="text-sm text-muted-foreground">
              Generate a schedule to see your timetable here
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
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

      {/* Schedule Tabs */}
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
            <Button variant="outline" size="icon" className="size-8">
              <Filter className="size-4" />
            </Button>
          </div>
        </div>

        {/* Week View */}
        <TabsContent value="week">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>This Week</CardTitle>
                  <CardDescription>December 23 - 27, 2024</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <CheckCircle2 className="mr-1 size-3" />
                    All Good
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-200">
                  {/* Day Headers */}
                  <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b">
                    <div className="p-3 text-xs font-medium text-muted-foreground">
                      <Clock className="size-4" />
                    </div>
                    {days.map((day, i) => (
                      <div key={day} className="p-3 text-center border-l">
                        <div className="text-sm font-medium">{day}</div>
                        <div className="text-xs text-muted-foreground">{23 + i}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-[80px_repeat(5,1fr)]">
                    {/* Time Labels */}
                    <div className="border-r">
                      {hours.map((hour) => (
                        <div key={hour} className="h-15 border-b px-3 py-1">
                          <span className="text-xs text-muted-foreground">{formatHour(hour)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Day Columns */}
                    {days.map((day) => (
                      <div key={day} className="relative border-l" style={{ height: `${hours.length * 60}px` }}>
                        {/* Hour lines */}
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="absolute w-full border-b border-dashed border-muted/50"
                            style={{ top: `${(hour - 8) * 60}px`, height: '60px' }}
                          />
                        ))}

                        {/* Sessions */}
                        {sessions
                          .filter((s) => s.day === day)
                          .map((session) => {
                            const colors = getColorClasses(session.color)
                            return (
                              <div
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`absolute left-1 right-1 rounded-md border-l-4 px-2 py-1.5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${colors.bg} ${colors.border}`}
                                style={getSessionStyle(session.startHour, session.duration)}
                              >
                                <div className={`text-xs font-semibold ${colors.text}`}>{session.course}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <DoorOpen className="size-3" />
                                  {session.room}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Room View */}
        <TabsContent value="room">
          <div className="grid gap-4 md:grid-cols-2">
            {[...new Set(sessions.map(s => s.room))].map((room) => {
              const roomSessions = sessions.filter(s => s.room === room)
              const firstSession = roomSessions[0]
              return (
                <Card key={room} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2 bg-primary/10">
                        <DoorOpen className="size-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base leading-none">{room}</CardTitle>
                        <CardDescription className="mt-1">{firstSession?.building || 'Unknown Building'}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{roomSessions.length} sessions</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {roomSessions.map((session) => {
                        const colors = getColorClasses(session.color)
                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSession(session)}
                            className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            <div className={`w-1 h-10 rounded-full ${colors.border.replace('border-l-', 'bg-')}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${colors.text}`}>{session.course}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {session.day} • {formatHour(session.startHour)} - {formatHour(session.startHour + session.duration)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="size-3" />
                              {session.capacity}
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
            {[...new Set(sessions.map(s => s.course))].map((courseName) => {
              const courseSessions = sessions.filter(s => s.course === courseName)
              const firstSession = courseSessions[0]
              const colors = getColorClasses(firstSession.color)
              return (
                <Card key={courseName} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-10 rounded-full ${colors.border.replace('border-l-', 'bg-')}`} />
                      <div>
                        <CardTitle className={`text-base leading-none ${colors.text}`}>{courseName}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary">{courseSessions.length}x/week</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {courseSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="text-sm font-medium">{session.day}</div>
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className={getColorClasses(selectedSession.color).text}>
                  {selectedSession.course}
                </DialogTitle>
                <DialogDescription>{selectedSession.courseName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Day & Time</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="size-4" />
                      {selectedSession.day}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatHour(selectedSession.startHour)} - {formatHour(selectedSession.startHour + selectedSession.duration)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <DoorOpen className="size-4" />
                      {selectedSession.room}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      {selectedSession.building}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Room Capacity</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Users className="size-4" />
                    {selectedSession.capacity} seats
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
