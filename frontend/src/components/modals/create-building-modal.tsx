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
import { Building2, Loader2 } from 'lucide-react'

interface CreateBuildingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (building: BuildingFormData) => void
  isLoading?: boolean
}

interface BuildingFormData {
  name: string
}

export function CreateBuildingModal({ open, onOpenChange, onSubmit, isLoading }: CreateBuildingModalProps) {
  const [formData, setFormData] = useState<BuildingFormData>({
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
              onBlur={() => setTouched(true)}
              disabled={isLoading}
              aria-invalid={showError}
              className={showError ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {showError && (
              <p className="text-xs text-destructive">Building name is required</p>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Building'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
