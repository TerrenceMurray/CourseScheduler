import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Plus,
  Users,
  DoorOpen,
  Building2,
  Search,
  MoreHorizontal,
  Presentation,
  FlaskConical,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CountUp } from '@/components/count-up'
import { CreateRoomModal } from '@/components/modals'
import { useRooms, useCreateRoom, useDeleteRoom } from '@/hooks'
import { useBuildings } from '@/hooks'
import { useRoomTypes } from '@/hooks'
import { CardListSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'

export const Route = createFileRoute('/app/rooms')({
  component: RoomsPage,
})

function RoomsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: rooms = [], isLoading, isError, refetch } = useRooms()
  const { data: buildings = [] } = useBuildings()
  const { data: roomTypes = [] } = useRoomTypes()
  const createRoom = useCreateRoom()
  const deleteRoom = useDeleteRoom()

  // Create lookup maps
  const buildingMap = useMemo(() => {
    return new Map(buildings.map(b => [b.id, b.name]))
  }, [buildings])

  // Filter rooms
  const filteredRooms = useMemo(() => {
    let result = rooms

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        buildingMap.get(r.building_id)?.toLowerCase().includes(query)
      )
    }

    if (buildingFilter !== 'all') {
      result = result.filter(r => r.building_id === buildingFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter(r => r.type === typeFilter)
    }

    return result
  }, [rooms, searchQuery, buildingFilter, typeFilter, buildingMap])

  const handleCreate = (data: {
    name: string
    building: string
    type: string
    capacity: number
  }) => {
    // Find building ID by name
    const building = buildings.find(b => b.name === data.building)
    if (!building) return

    createRoom.mutate({
      name: data.name,
      building_id: building.id,
      type: data.type,
      capacity: data.capacity,
    }, {
      onSuccess: () => setCreateModalOpen(false),
    })
  }

  const handleDelete = (id: string) => {
    deleteRoom.mutate(id)
  }

  const stats = [
    {
      title: 'Total Rooms',
      value: filteredRooms.length.toString(),
      icon: DoorOpen,
      description: 'Across all buildings',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Capacity',
      value: filteredRooms.reduce((sum, r) => sum + r.capacity, 0).toString(),
      icon: Users,
      description: 'Combined seating',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
    },
    {
      title: 'Buildings',
      value: buildings.length.toString(),
      icon: Building2,
      description: 'With rooms',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Room Types',
      value: roomTypes.length.toString(),
      icon: Presentation,
      description: 'Categories',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ]

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: typeof DoorOpen; bg: string; text: string; border: string }> = {
      'lecture_room': {
        icon: Presentation,
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
      },
      'computer_lab': {
        icon: FlaskConical,
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        border: 'border-emerald-500/20',
      },
    }
    return configs[type] || {
      icon: DoorOpen,
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
      border: 'border-violet-500/20',
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
            <p className="text-muted-foreground">Manage available rooms and their capacities</p>
          </div>
        </div>
        <CardListSkeleton cards={8} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage available rooms and their capacities</p>
        </div>
        <ErrorState message="Failed to load rooms" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">
            Manage available rooms and their capacities
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Room
        </Button>
      </div>

      <CreateRoomModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        buildings={buildings.map(b => b.name)}
        roomTypes={roomTypes.map(rt => rt.name)}
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

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Rooms</CardTitle>
              <CardDescription>Browse and manage room inventory</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger className="w-44">
                  <Building2 className="mr-2 size-4" />
                  <SelectValue placeholder="Building" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  {buildings.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes.map(rt => (
                    <SelectItem key={rt.name} value={rt.name}>{rt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-9 rounded-r-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-9 rounded-l-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || buildingFilter !== 'all' || typeFilter !== 'all' ? (
                <div className="space-y-2">
                  <p>No rooms match your filters</p>
                  <Button variant="link" onClick={() => {
                    setSearchQuery('')
                    setBuildingFilter('all')
                    setTypeFilter('all')
                  }}>
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No rooms found</p>
                  <Button variant="link" onClick={() => setCreateModalOpen(true)}>
                    Add your first room
                  </Button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRooms.map((room) => {
                const typeConfig = getTypeConfig(room.type)
                const TypeIcon = typeConfig.icon
                const buildingName = buildingMap.get(room.building_id) || 'Unknown'
                return (
                  <Card
                    key={room.id}
                    className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`rounded-lg p-2.5 ${typeConfig.bg}`}>
                          <TypeIcon className={`size-5 ${typeConfig.text}`} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(room.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-base">{room.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="size-3" />
                        {buildingName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                          {room.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => {
                  const typeConfig = getTypeConfig(room.type)
                  const TypeIcon = typeConfig.icon
                  const buildingName = buildingMap.get(room.building_id) || 'Unknown'
                  return (
                    <TableRow key={room.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex size-9 items-center justify-center rounded-lg ${typeConfig.bg}`}>
                            <TypeIcon className={`size-4 ${typeConfig.text}`} />
                          </div>
                          <span className="font-medium">{room.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="size-3" />
                          {buildingName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(room.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
