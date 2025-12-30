import { useState } from 'react'
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
import { Building2 } from 'lucide-react'

interface CreateBuildingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (building: BuildingFormData) => void
}

interface BuildingFormData {
  name: string
}

export function CreateBuildingModal({ open, onOpenChange, onSubmit }: CreateBuildingModalProps) {
  const [formData, setFormData] = useState<BuildingFormData>({
    name: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({ name: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Add New Building</DialogTitle>
            <DialogDescription>
              Register a new campus building to your inventory
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Building Name</Label>
            <Input
              id="name"
              placeholder="e.g., Science Building"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Building</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
