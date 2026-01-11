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
import { Pencil } from 'lucide-react'
import type { Building } from '@/types/api'

interface EditBuildingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: { name: string }) => void
  building: Building | null
  isLoading?: boolean
}

export function EditBuildingModal({ open, onOpenChange, onSubmit, building, isLoading }: EditBuildingModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (building && open) {
      setName(building.name)
    }
  }, [building, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ name })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
    }
    onOpenChange(open)
  }

  const hasChanges = building && name !== building.name

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <Pencil className="size-6 text-amber-500" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Edit Building</DialogTitle>
            <DialogDescription>
              Update the building details
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Building Name</Label>
            <Input
              id="name"
              placeholder="e.g., Science Building"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !hasChanges || isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
