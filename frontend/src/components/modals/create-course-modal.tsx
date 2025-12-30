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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NumberInput } from '@/components/ui/number-input'
import { BookOpen, FlaskConical, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateCourseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (course: CourseFormData) => void
  roomTypes?: string[]
}

interface CourseFormData {
  name: string
  type: string
  sessions: number
  sessionDuration: number
  requiredRoom: string
}

export function CreateCourseModal({ open, onOpenChange, onSubmit, roomTypes = [] }: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    type: 'Lecture',
    sessions: 2,
    sessionDuration: 1.5,
    requiredRoom: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({
      name: '',
      type: 'Lecture',
      sessions: 2,
      sessionDuration: 1.5,
      requiredRoom: '',
    })
  }

  const courseTypes = [
    { value: 'Lecture', label: 'Lecture', icon: BookOpen, description: 'Traditional classroom instruction' },
    { value: 'Lab', label: 'Laboratory', icon: FlaskConical, description: 'Hands-on practical sessions' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to your curriculum with session details
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Course Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Course Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {courseTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-muted bg-transparent'
                    )}
                  >
                    <div className={cn(
                      'rounded-full p-2',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'size-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'font-medium text-sm',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Course Name</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Required Room Type */}
          <div className="space-y-2">
            <Label htmlFor="requiredRoom" className="text-sm">Required Room Type</Label>
            <Select
              value={formData.requiredRoom}
              onValueChange={(value) => setFormData({ ...formData, requiredRoom: value })}
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

          {/* Schedule */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Schedule</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessions" className="text-sm flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  Sessions/Week
                </Label>
                <NumberInput
                  value={formData.sessions}
                  onChange={(value) => setFormData({ ...formData, sessions: value })}
                  min={1}
                  max={7}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">Duration (hrs)</Label>
                <Select
                  value={formData.sessionDuration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, sessionDuration: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0.5, 1, 1.5, 2, 2.5, 3].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Summary */}
          {formData.name && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm">
                <span className="font-medium">{formData.name}</span>
                {' '}&middot;{' '}
                <span className="text-muted-foreground">
                  {formData.sessions}x {formData.sessionDuration}h = {formData.sessions * formData.sessionDuration}h/week
                </span>
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.requiredRoom}>
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
