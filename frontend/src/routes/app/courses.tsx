import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  BookOpen,
  Clock,
  FlaskConical,
  GraduationCap,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CountUp } from '@/components/count-up'
import { CreateCourseModal } from '@/components/modals'
import { useCourses, useCreateCourse, useDeleteCourse } from '@/hooks'
import { useSessions, useCreateSession } from '@/hooks'
import { useRoomTypes } from '@/hooks'
import { TableSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import type { SessionType } from '@/types/api'

export const Route = createFileRoute('/app/courses')({
  component: CoursesPage,
})

type SortField = 'name' | 'sessions' | 'totalHours'
type SortDirection = 'asc' | 'desc'

function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data: allCourses = [], isLoading, isError, refetch } = useCourses()
  const { data: allSessions = [] } = useSessions()
  const { data: roomTypes = [] } = useRoomTypes()
  const createCourse = useCreateCourse()
  const createSession = useCreateSession()
  const deleteCourse = useDeleteCourse()

  // Get room type names for the modal
  const roomTypeNames = roomTypes.map(rt => rt.name)

  // Build enriched courses with session data
  const enrichedCourses = useMemo(() => {
    return allCourses.map(course => {
      const courseSessions = allSessions.filter(s => s.course_id === course.id)
      const totalSessions = courseSessions.reduce((sum, s) => sum + s.number_of_sessions, 0)
      const totalMinutes = courseSessions.reduce((sum, s) => sum + (s.duration * s.number_of_sessions), 0)
      const types = [...new Set(courseSessions.map(s => s.type))]
      const primaryType = types.includes('lab') ? 'lab' : types.includes('lecture') ? 'lecture' : 'tutorial'

      return {
        id: course.id,
        name: course.name,
        sessions: totalSessions,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        type: primaryType,
        sessionDetails: courseSessions,
      }
    })
  }, [allCourses, allSessions])

  // Filter and sort courses
  const courses = useMemo(() => {
    let filtered = enrichedCourses

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => c.name.toLowerCase().includes(query))
    }

    if (typeFilter.length > 0) {
      filtered = filtered.filter(c => typeFilter.includes(c.type))
    }

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'sessions':
          comparison = a.sessions - b.sessions
          break
        case 'totalHours':
          comparison = a.totalHours - b.totalHours
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [enrichedCourses, searchQuery, typeFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === courses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(courses.map(c => c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteCourse.mutate(id))
    clearSelection()
  }

  const handleCreate = async (data: {
    name: string
    type: string
    sessions: number
    sessionDuration: number
    requiredRoom: string
  }) => {
    createCourse.mutate(
      { name: data.name },
      {
        onSuccess: (course) => {
          createSession.mutate({
            course_id: course.id,
            required_room: data.requiredRoom,
            type: data.type.toLowerCase() as SessionType,
            duration: Math.round(data.sessionDuration * 60),
            number_of_sessions: data.sessions,
          })
          setCreateModalOpen(false)
        },
      }
    )
  }

  const handleDeleteCourse = (id: string) => {
    deleteCourse.mutate(id)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 size-3" />
    return sortDirection === 'asc' ? <ArrowUp className="ml-1 size-3" /> : <ArrowDown className="ml-1 size-3" />
  }

  const stats = [
    {
      title: 'Total Courses',
      value: courses.length.toString(),
      icon: BookOpen,
      description: 'Active this semester',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Weekly Sessions',
      value: courses.reduce((sum, c) => sum + c.sessions, 0).toString(),
      icon: Clock,
      description: 'Scheduled per week',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
    },
    {
      title: 'Total Hours',
      value: courses.reduce((sum, c) => sum + c.totalHours, 0).toString() + 'h',
      icon: GraduationCap,
      description: 'Weekly teaching hours',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Lab Courses',
      value: courses.filter(c => c.type === 'lab').length.toString(),
      icon: FlaskConical,
      description: 'Hands-on sessions',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ]

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'lab':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' }
      case 'lecture':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' }
      case 'tutorial':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' }
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">Manage your courses, sessions, and curriculum</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage your courses, sessions, and curriculum</p>
        </div>
        <ErrorState message="Failed to load courses" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses, sessions, and curriculum
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Course
        </Button>
      </div>

      <CreateCourseModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        roomTypes={roomTypeNames}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-stagger">
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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>A list of all courses in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className={typeFilter.length > 0 ? 'border-primary' : ''}>
                    <Filter className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('lecture')}
                    onCheckedChange={() => toggleTypeFilter('lecture')}
                  >
                    <BookOpen className="mr-2 size-4" />
                    Lecture
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('lab')}
                    onCheckedChange={() => toggleTypeFilter('lab')}
                  >
                    <FlaskConical className="mr-2 size-4" />
                    Lab
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('tutorial')}
                    onCheckedChange={() => toggleTypeFilter('tutorial')}
                  >
                    <GraduationCap className="mr-2 size-4" />
                    Tutorial
                  </DropdownMenuCheckboxItem>
                  {typeFilter.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTypeFilter([])}>
                        <X className="mr-2 size-4" />
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-6 py-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <X className="mr-2 size-3" />
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 size-3" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={courses.length > 0 && selectedIds.size === courses.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Course
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">
                  <button
                    onClick={() => handleSort('sessions')}
                    className="flex items-center justify-center w-full hover:text-foreground transition-colors"
                  >
                    Sessions
                    <SortIcon field="sessions" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort('totalHours')}
                    className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                  >
                    Hours/Week
                    <SortIcon field="totalHours" />
                  </button>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery || typeFilter.length > 0 ? (
                      <div className="space-y-2">
                        <p>No courses match your filters</p>
                        <Button variant="link" onClick={() => { setSearchQuery(''); setTypeFilter([]) }}>
                          Clear all filters
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>No courses found</p>
                        <Button variant="link" onClick={() => setCreateModalOpen(true)}>
                          Add your first course
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : courses.map((course) => {
                const typeStyles = getTypeStyles(course.type)
                return (
                  <TableRow key={course.id} className={selectedIds.has(course.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(course.id)}
                        onCheckedChange={() => toggleSelect(course.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-lg ${typeStyles.bg}`}>
                          {course.type === 'lab' ? (
                            <FlaskConical className={`size-5 ${typeStyles.text}`} />
                          ) : course.type === 'tutorial' ? (
                            <GraduationCap className={`size-5 ${typeStyles.text}`} />
                          ) : (
                            <BookOpen className={`size-5 ${typeStyles.text}`} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{course.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${typeStyles.bg} ${typeStyles.text} ${typeStyles.border} capitalize`}>
                        {course.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex -space-x-1">
                          {Array.from({ length: Math.min(course.sessions, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className="size-2 rounded-full bg-primary ring-2 ring-background"
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm">{course.sessions}x</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{course.totalHours}h</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Course</DropdownMenuItem>
                          <DropdownMenuItem>View Sessions</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
