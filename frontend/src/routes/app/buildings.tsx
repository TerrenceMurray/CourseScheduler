import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Plus,
  DoorOpen,
  MoreHorizontal,
  Building2,
  Users,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateBuildingModal, EditBuildingModal } from '@/components/modals'
import { useBuildings, useCreateBuilding, useUpdateBuilding, useDeleteBuilding } from '@/hooks'
import type { Building } from '@/types/api'
import { useRooms } from '@/hooks'
import { CardListSkeleton } from '@/components/loading-skeleton'
import { ErrorState } from '@/components/error-state'
import { EmptyState } from '@/components/empty-state'
import { ConfirmDialog } from '@/components/confirm-dialog'

export const Route = createFileRoute('/app/buildings')({
  component: BuildingsPage,
})

function BuildingsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null)

  const { data: buildings = [], isLoading, isError, refetch } = useBuildings()
  const { data: rooms = [] } = useRooms()
  const createBuilding = useCreateBuilding()
  const updateBuilding = useUpdateBuilding()
  const deleteBuilding = useDeleteBuilding()

  // Calculate room counts per building
  const buildingRoomCounts = rooms.reduce(
    (acc, room) => {
      acc[room.building_id] = (acc[room.building_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate total capacity per building
  const buildingCapacity = rooms.reduce(
    (acc, room) => {
      acc[room.building_id] = (acc[room.building_id] || 0) + room.capacity
      return acc
    },
    {} as Record<string, number>
  )

  const totalRooms = rooms.length
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)

  // Filter buildings by search query
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = (data: { name: string }) => {
    createBuilding.mutate({ name: data.name }, {
      onSuccess: () => setCreateModalOpen(false),
    })
  }

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete(building)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (buildingToDelete) {
      deleteBuilding.mutate(buildingToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setBuildingToDelete(null)
        },
      })
    }
  }

  const handleEdit = (building: Building) => {
    setEditingBuilding(building)
    setEditModalOpen(true)
  }

  const handleUpdate = (data: { name: string }) => {
    if (!editingBuilding) return
    updateBuilding.mutate(
      { id: editingBuilding.id, data },
      { onSuccess: () => setEditModalOpen(false) }
    )
  }

  // Color assignment based on building index
  const colors = ['blue', 'violet', 'amber', 'emerald', 'rose']
  const getColorClasses = (index: number) => {
    const color = colors[index % colors.length]
    const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', badge: 'bg-violet-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', badge: 'bg-emerald-500' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', badge: 'bg-rose-500' },
    }
    return colorMap[color]
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Buildings</h1>
            <p className="text-muted-foreground">
              Manage campus buildings and their facilities
            </p>
          </div>
        </div>
        <CardListSkeleton cards={6} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buildings</h1>
          <p className="text-muted-foreground">
            Manage campus buildings and their facilities
          </p>
        </div>
        <ErrorState message="Failed to load buildings" onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buildings</h1>
          <p className="text-muted-foreground">
            Manage campus buildings and their facilities
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Building
        </Button>
      </div>

      <CreateBuildingModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createBuilding.isPending}
      />

      <EditBuildingModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleUpdate}
        building={editingBuilding}
        isLoading={updateBuilding.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Building"
        description={`Are you sure you want to delete "${buildingToDelete?.name}"? This action cannot be undone. Any rooms in this building will need to be reassigned.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteBuilding.isPending}
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 animate-stagger">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{buildings.length}</p>
              <p className="text-sm text-muted-foreground">Buildings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <DoorOpen className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRooms}</p>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buildings Grid */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">All Buildings</h2>
            <p className="text-sm text-muted-foreground">Click on a building to manage its rooms</p>
          </div>
          {buildings.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search buildings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>

        {buildings.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No buildings yet"
            description="Buildings are the first step in setting up your schedule. Add campus buildings where classes will be held."
            action={{
              label: "Add First Building",
              onClick: () => setCreateModalOpen(true),
            }}
          />
        ) : filteredBuildings.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No buildings found"
            description={`No buildings match "${searchQuery}". Try a different search term.`}
            action={{
              label: "Clear Search",
              onClick: () => setSearchQuery(''),
            }}
          />
        ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBuildings.map((building, index) => {
            const colorClasses = getColorClasses(index)
            const roomCount = buildingRoomCounts[building.id] || 0
            const capacity = buildingCapacity[building.id] || 0

            return (
              <Card
                key={building.id}
                className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2.5 ${colorClasses.bg}`}>
                        <Building2 className={`size-5 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{building.name}</CardTitle>
                      </div>
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
                        <DropdownMenuItem onClick={() => handleEdit(building)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DoorOpen className="mr-2 size-4" />
                          View Rooms
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(building)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <DoorOpen className="size-3" />
                        Rooms
                      </div>
                      <p className="font-semibold">{roomCount}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                        <Users className="size-3" />
                        Capacity
                      </div>
                      <p className="font-semibold">{capacity}</p>
                    </div>
                  </div>

                  {/* Room Distribution Mini Visualization */}
                  {roomCount > 0 && (
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(roomCount, 15) }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${colorClasses.badge}`}
                          style={{ opacity: 0.4 + (i % 3) * 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* Add New Card */}
          <Card
            className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors min-h-48"
            onClick={() => setCreateModalOpen(true)}
          >
            <CardContent className="flex flex-col items-center gap-2 text-center p-6">
              <div className="rounded-full bg-muted p-3">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <p className="font-medium">Add New Building</p>
              <p className="text-sm text-muted-foreground">Register a new campus building</p>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  )
}
