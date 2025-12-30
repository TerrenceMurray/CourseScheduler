import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NumberInput } from '@/components/ui/number-input'
import { Badge } from '@/components/ui/badge'
import { Building2, DoorOpen, Users, Pencil } from 'lucide-react'
import type { Room, Building } from '@/types/api'

interface EditRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: RoomFormData) => void
  room: Room | null
  buildings?: Building[]
  roomTypes?: string[]
  isLoading?: boolean
}

interface RoomFormData {
  name: string
  building_id: string
  type: string
  capacity: number
}

export function EditRoomModal({
  open,
  onOpenChange,
  onSubmit,
  room,
  buildings = [],
  roomTypes = [],
  isLoading,
}: EditRoomModalProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    building_id: '',
    type: '',
    capacity: 40,
  })

  useEffect(() => {
    if (room && open) {
      setFormData({
        name: room.name,
        building_id: room.building_id,
        type: room.type,
        capacity: room.capacity,
      })
    }
  }, [room, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: '',
        building_id: '',
        type: '',
        capacity: 40,
      })
    }
    onOpenChange(open)
  }

  const hasChanges = room && (
    formData.name !== room.name ||
    formData.building_id !== room.building_id ||
    formData.type !== room.type ||
    formData.capacity !== room.capacity
  )

  const selectedBuilding = buildings.find(b => b.id === formData.building_id)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <Pencil className="size-6 text-amber-500" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Edit Room</DialogTitle>
            <DialogDescription>
              Update room details
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Room Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Room Name / Number</Label>
              <Input
                id="name"
                placeholder="e.g., Room 101 or Lab A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building" className="text-sm">Building</Label>
              <Select
                value={formData.building_id}
                onValueChange={(value) => setFormData({ ...formData, building_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span>{building.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">Room Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm flex items-center gap-1">
              <Users className="size-3 text-muted-foreground" />
              Seating Capacity
            </Label>
            <NumberInput
              value={formData.capacity}
              onChange={(value) => setFormData({ ...formData, capacity: value })}
              min={1}
              max={500}
              step={5}
            />
          </div>

          {/* Summary */}
          {formData.name && formData.building_id && formData.type && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2">
                  <DoorOpen className="size-4 text-violet-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{formData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBuilding?.name || 'Unknown Building'} - {formData.type}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Users className="size-3 mr-1" />
                {formData.capacity} seats
              </Badge>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.building_id || !formData.type || !hasChanges || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
