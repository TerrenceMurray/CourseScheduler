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
import { Tag, Loader2 } from 'lucide-react'

interface CreateRoomTypeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (roomType: RoomTypeFormData) => void
  isLoading?: boolean
}

interface RoomTypeFormData {
  name: string
}

export function CreateRoomTypeModal({ open, onOpenChange, onSubmit, isLoading }: CreateRoomTypeModalProps) {
  const [formData, setFormData] = useState<RoomTypeFormData>({
    name: '',
  })
  const [touched, setTouched] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({ name: '' })
      setTouched(false)
    }
  }, [open])

  const isValid = formData.name.trim().length > 0
  const showError = touched && !isValid

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    onSubmit?.(formData)
  }

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Tag className="size-6 text-primary" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Create Room Type</DialogTitle>
            <DialogDescription>
              Define a new category for organizing your rooms (e.g., Lecture Hall, Lab, Tutorial Room)
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Type Name</Label>
            <Input
              id="name"
              placeholder="e.g., Computer Lab, Lecture Hall"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => setTouched(true)}
              disabled={isLoading}
              aria-invalid={showError}
              className={showError ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {showError && (
              <p className="text-xs text-destructive">Room type name is required</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Type'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
