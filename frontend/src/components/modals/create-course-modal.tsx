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
import { BookOpen } from 'lucide-react'

interface CreateCourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (course: { name: string }) => void
  isLoading?: boolean
}

export function CreateCourseModal({ open, onOpenChange, onSubmit, isLoading }: CreateCourseModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({ name })
    setName('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to your curriculum. You can add sessions after creating it.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Course Name</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Computer Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? 'Creating...' : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
