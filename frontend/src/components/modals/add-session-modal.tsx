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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NumberInput } from '@/components/ui/number-input'
import { BookOpen, FlaskConical, GraduationCap, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (session: SessionFormData) => void
  courseName?: string
  roomTypes?: string[]
  isLoading?: boolean
}

export interface SessionFormData {
  type: 'lecture' | 'lab' | 'tutorial'
  sessions: number
  sessionDuration: number
  requiredRoom: string
}

export function AddSessionModal({
  open,
  onOpenChange,
  onSubmit,
  courseName = 'Course',
  roomTypes = [],
  isLoading
}: AddSessionModalProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    type: 'lecture',
    sessions: 2,
    sessionDuration: 1.5,
    requiredRoom: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        type: 'lecture',
        sessions: 2,
        sessionDuration: 1.5,
        requiredRoom: '',
      })
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const sessionTypes = [
    { value: 'lecture', label: 'Lecture', icon: BookOpen, description: 'Traditional classroom instruction' },
    { value: 'lab', label: 'Laboratory', icon: FlaskConical, description: 'Hands-on practical sessions' },
    { value: 'tutorial', label: 'Tutorial', icon: GraduationCap, description: 'Small group discussion' },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Clock className="size-6 text-emerald-500" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Add Session</DialogTitle>
            <DialogDescription>
              Add a new session type to <span className="font-medium text-foreground">{courseName}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Session Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Session Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {sessionTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all hover:border-primary/50',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-muted bg-transparent'
                    )}
                  >
                    <div className={cn(
                      'rounded-full p-1.5',
                      isSelected ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn(
                        'size-4',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <p className={cn(
                      'font-medium text-xs',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}>{type.label}</p>
                  </button>
                )
              })}
            </div>
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
                {roomTypes.length === 0 ? (
                  <SelectItem value="none" disabled>No room types available</SelectItem>
                ) : (
                  roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {roomTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create room types first in the Room Types page
              </p>
            )}
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
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm">
              <span className="font-medium capitalize">{formData.type}</span>
              {' '}&middot;{' '}
              <span className="text-muted-foreground">
                {formData.sessions}x {formData.sessionDuration}h = {formData.sessions * formData.sessionDuration}h/week
              </span>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.requiredRoom || isLoading}>
              {isLoading ? 'Adding...' : 'Add Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
