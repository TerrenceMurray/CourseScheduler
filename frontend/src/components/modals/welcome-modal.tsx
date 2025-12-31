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
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  BookOpen,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  LayoutGrid,
  Clock,
  MousePointerClick,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Illustration for Smart Scheduling slide
function ScheduleIllustration() {
  return (
    <svg viewBox="0 0 280 140" fill="none" className="w-full h-auto">
      {/* Background */}
      <rect width="280" height="140" rx="8" className="fill-violet-500/5" />

      {/* Calendar frame */}
      <g transform="translate(20, 15)">
        <rect width="240" height="110" rx="6" className="fill-background stroke-border" strokeWidth="1" />

        {/* Header */}
        <rect width="240" height="24" rx="6" className="fill-muted/50" />
        <rect y="18" width="240" height="6" className="fill-muted/50" />

        {/* Day headers */}
        <g className="fill-muted-foreground text-[9px]" fontFamily="system-ui" fontWeight="500">
          <text x="28" y="18" textAnchor="middle">Mon</text>
          <text x="76" y="18" textAnchor="middle">Tue</text>
          <text x="124" y="18" textAnchor="middle">Wed</text>
          <text x="172" y="18" textAnchor="middle">Thu</text>
          <text x="220" y="18" textAnchor="middle">Fri</text>
        </g>

        {/* Grid lines */}
        <g className="stroke-border" strokeWidth="0.5">
          <line x1="0" y1="44" x2="240" y2="44" />
          <line x1="0" y1="64" x2="240" y2="64" />
          <line x1="0" y1="84" x2="240" y2="84" />
          <line x1="48" y1="24" x2="48" y2="110" />
          <line x1="96" y1="24" x2="96" y2="110" />
          <line x1="144" y1="24" x2="144" y2="110" />
          <line x1="192" y1="24" x2="192" y2="110" />
        </g>

        {/* Schedule blocks */}
        <rect x="4" y="28" width="40" height="14" rx="3" className="fill-violet-500" />
        <rect x="52" y="48" width="40" height="14" rx="3" className="fill-emerald-500" />
        <rect x="100" y="28" width="40" height="14" rx="3" className="fill-blue-500" />
        <rect x="148" y="68" width="40" height="14" rx="3" className="fill-amber-500" />
        <rect x="196" y="48" width="40" height="14" rx="3" className="fill-violet-400" />
        <rect x="4" y="68" width="40" height="14" rx="3" className="fill-blue-400" />
        <rect x="100" y="88" width="40" height="14" rx="3" className="fill-emerald-400" />
        <rect x="52" y="88" width="40" height="14" rx="3" className="fill-rose-400" />
      </g>

      {/* Sparkle icon */}
      <g transform="translate(232, 100)">
        <circle cx="14" cy="14" r="14" className="fill-violet-500/10" />
        <g transform="translate(7, 7)">
          <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" className="fill-violet-500" />
        </g>
      </g>
    </svg>
  )
}

// Illustration for Resource Management slide
function BuildingIllustration() {
  return (
    <svg viewBox="0 0 280 140" fill="none" className="w-full h-auto">
      {/* Background */}
      <rect width="280" height="140" rx="8" className="fill-blue-500/5" />

      {/* Main building */}
      <g transform="translate(85, 15)">
        <rect width="110" height="100" rx="6" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="110" height="20" rx="6" className="fill-blue-500/10" />
        <rect y="14" width="110" height="6" className="fill-blue-500/10" />

        {/* Building name */}
        <text x="55" y="14" textAnchor="middle" className="fill-blue-600 text-[8px]" fontFamily="system-ui" fontWeight="600">MAIN BUILDING</text>

        {/* Room grid - 4x3 */}
        <g transform="translate(8, 28)">
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={col * 24}
                y={row * 22}
                width="20"
                height="18"
                rx="3"
                className={cn(
                  'stroke-border',
                  (row === 0 && col === 1) ? 'fill-emerald-500/30' :
                  (row === 1 && col === 3) ? 'fill-amber-500/30' :
                  (row === 2 && col === 0) ? 'fill-blue-500/30' :
                  (row === 1 && col === 1) ? 'fill-violet-500/30' :
                  'fill-muted/30'
                )}
                strokeWidth="0.5"
              />
            ))
          )}
        </g>
      </g>

      {/* Left small building */}
      <g transform="translate(20, 55)">
        <rect width="50" height="60" rx="4" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="50" height="14" rx="4" className="fill-emerald-500/10" />
        <rect y="10" width="50" height="4" className="fill-emerald-500/10" />

        {/* Rooms */}
        <rect x="6" y="22" width="16" height="14" rx="2" className="fill-emerald-500/20 stroke-border" strokeWidth="0.5" />
        <rect x="28" y="22" width="16" height="14" rx="2" className="fill-muted/30 stroke-border" strokeWidth="0.5" />
        <rect x="6" y="42" width="16" height="14" rx="2" className="fill-muted/30 stroke-border" strokeWidth="0.5" />
        <rect x="28" y="42" width="16" height="14" rx="2" className="fill-blue-500/20 stroke-border" strokeWidth="0.5" />
      </g>

      {/* Right small building */}
      <g transform="translate(210, 45)">
        <rect width="50" height="70" rx="4" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="50" height="14" rx="4" className="fill-violet-500/10" />
        <rect y="10" width="50" height="4" className="fill-violet-500/10" />

        {/* Rooms */}
        <rect x="6" y="22" width="16" height="14" rx="2" className="fill-violet-500/20 stroke-border" strokeWidth="0.5" />
        <rect x="28" y="22" width="16" height="14" rx="2" className="fill-amber-500/20 stroke-border" strokeWidth="0.5" />
        <rect x="6" y="42" width="16" height="14" rx="2" className="fill-muted/30 stroke-border" strokeWidth="0.5" />
        <rect x="28" y="42" width="16" height="14" rx="2" className="fill-muted/30 stroke-border" strokeWidth="0.5" />
      </g>

      {/* Connection dots */}
      <circle cx="75" cy="85" r="3" className="fill-blue-500/30" />
      <circle cx="205" cy="80" r="3" className="fill-blue-500/30" />
    </svg>
  )
}

// Illustration for Course Planning slide
function CourseIllustration() {
  return (
    <svg viewBox="0 0 280 140" fill="none" className="w-full h-auto">
      {/* Background */}
      <rect width="280" height="140" rx="8" className="fill-emerald-500/5" />

      {/* Course card 1 - Lecture */}
      <g transform="translate(15, 20)">
        <rect width="115" height="50" rx="6" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="115" height="16" rx="6" className="fill-emerald-500/10" />
        <rect y="12" width="115" height="4" className="fill-emerald-500/10" />

        <circle cx="12" cy="8" r="4" className="fill-emerald-500" />
        <text x="22" y="11" className="fill-emerald-600 text-[7px]" fontFamily="system-ui" fontWeight="600">LECTURE</text>

        <rect x="8" y="22" width="60" height="4" rx="1" className="fill-foreground/50" />
        <rect x="8" y="30" width="80" height="3" rx="1" className="fill-muted-foreground/20" />
        <rect x="8" y="37" width="55" height="3" rx="1" className="fill-muted-foreground/20" />

        <rect x="75" y="22" width="32" height="12" rx="3" className="fill-emerald-500/15" />
        <text x="91" y="31" textAnchor="middle" className="fill-emerald-600 text-[7px]" fontFamily="system-ui" fontWeight="500">2× 1.5h</text>
      </g>

      {/* Course card 2 - Lab */}
      <g transform="translate(150, 15)">
        <rect width="115" height="50" rx="6" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="115" height="16" rx="6" className="fill-blue-500/10" />
        <rect y="12" width="115" height="4" className="fill-blue-500/10" />

        <circle cx="12" cy="8" r="4" className="fill-blue-500" />
        <text x="22" y="11" className="fill-blue-600 text-[7px]" fontFamily="system-ui" fontWeight="600">LABORATORY</text>

        <rect x="8" y="22" width="50" height="4" rx="1" className="fill-foreground/50" />
        <rect x="8" y="30" width="75" height="3" rx="1" className="fill-muted-foreground/20" />
        <rect x="8" y="37" width="60" height="3" rx="1" className="fill-muted-foreground/20" />

        <rect x="75" y="22" width="32" height="12" rx="3" className="fill-blue-500/15" />
        <text x="91" y="31" textAnchor="middle" className="fill-blue-600 text-[7px]" fontFamily="system-ui" fontWeight="500">1× 3h</text>
      </g>

      {/* Course card 3 - Tutorial */}
      <g transform="translate(80, 75)">
        <rect width="115" height="50" rx="6" className="fill-background stroke-border" strokeWidth="1" />
        <rect width="115" height="16" rx="6" className="fill-violet-500/10" />
        <rect y="12" width="115" height="4" className="fill-violet-500/10" />

        <circle cx="12" cy="8" r="4" className="fill-violet-500" />
        <text x="22" y="11" className="fill-violet-600 text-[7px]" fontFamily="system-ui" fontWeight="600">TUTORIAL</text>

        <rect x="8" y="22" width="55" height="4" rx="1" className="fill-foreground/50" />
        <rect x="8" y="30" width="70" height="3" rx="1" className="fill-muted-foreground/20" />
        <rect x="8" y="37" width="50" height="3" rx="1" className="fill-muted-foreground/20" />

        <rect x="75" y="22" width="32" height="12" rx="3" className="fill-violet-500/15" />
        <text x="91" y="31" textAnchor="middle" className="fill-violet-600 text-[7px]" fontFamily="system-ui" fontWeight="500">1× 1h</text>
      </g>

      {/* Add button */}
      <g transform="translate(220, 95)">
        <circle cx="16" cy="16" r="16" className="fill-emerald-500/10" />
        <rect x="10" y="14.5" width="12" height="3" rx="1" className="fill-emerald-500" />
        <rect x="14.5" y="10" width="3" height="12" rx="1" className="fill-emerald-500" />
      </g>
    </svg>
  )
}

// Illustration for Visualization slide
function ViewsIllustration() {
  return (
    <svg viewBox="0 0 280 140" fill="none" className="w-full h-auto">
      {/* Background */}
      <rect width="280" height="140" rx="8" className="fill-amber-500/5" />

      {/* Tab bar */}
      <g transform="translate(40, 12)">
        <rect width="200" height="28" rx="6" className="fill-muted/50" />
        <rect x="4" y="4" width="60" height="20" rx="4" className="fill-amber-500" />
        <text x="34" y="18" textAnchor="middle" className="fill-white text-[9px]" fontFamily="system-ui" fontWeight="500">Week</text>
        <text x="102" y="18" textAnchor="middle" className="fill-muted-foreground text-[9px]" fontFamily="system-ui" fontWeight="500">Room</text>
        <text x="166" y="18" textAnchor="middle" className="fill-muted-foreground text-[9px]" fontFamily="system-ui" fontWeight="500">Course</text>
      </g>

      {/* Main content area */}
      <g transform="translate(20, 48)">
        <rect width="240" height="80" rx="6" className="fill-background stroke-border" strokeWidth="1" />

        {/* Day headers */}
        <g className="fill-amber-600/70 text-[8px]" fontFamily="system-ui" fontWeight="500">
          <text x="28" y="14" textAnchor="middle">Mon</text>
          <text x="76" y="14" textAnchor="middle">Tue</text>
          <text x="124" y="14" textAnchor="middle">Wed</text>
          <text x="172" y="14" textAnchor="middle">Thu</text>
          <text x="220" y="14" textAnchor="middle">Fri</text>
        </g>

        {/* Grid lines */}
        <g className="stroke-border" strokeWidth="0.5">
          <line x1="0" y1="22" x2="240" y2="22" />
          <line x1="0" y1="42" x2="240" y2="42" />
          <line x1="0" y1="62" x2="240" y2="62" />
        </g>

        {/* Schedule blocks */}
        <rect x="8" y="26" width="40" height="14" rx="3" className="fill-amber-500" />
        <rect x="56" y="46" width="40" height="14" rx="3" className="fill-emerald-500" />
        <rect x="104" y="26" width="40" height="14" rx="3" className="fill-blue-500" />
        <rect x="152" y="66" width="40" height="12" rx="3" className="fill-violet-500" />
        <rect x="200" y="46" width="36" height="14" rx="3" className="fill-amber-400" />
        <rect x="8" y="66" width="40" height="12" rx="3" className="fill-blue-400" />
        <rect x="104" y="66" width="40" height="12" rx="3" className="fill-emerald-400" />
      </g>

      {/* Checkmark icon */}
      <g transform="translate(232, 100)">
        <circle cx="14" cy="14" r="14" className="fill-amber-500/10" />
        <path d="M9 14L12 17L19 10" className="stroke-amber-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  )
}

const slides = [
  {
    badge: 'Smart Scheduling',
    title: 'Automated Timetable Generation',
    description:
      'Our intelligent algorithm creates conflict-free schedules in seconds, considering room availability, course requirements, and time constraints.',
    icon: Sparkles,
    color: 'violet',
    illustration: ScheduleIllustration,
    features: [
      { icon: Zap, text: 'Instant schedule generation' },
      { icon: Clock, text: 'No time conflicts guaranteed' },
      { icon: LayoutGrid, text: 'Optimal room utilization' },
    ],
  },
  {
    badge: 'Resource Management',
    title: 'Organize Your Campus',
    description:
      'Manage your entire campus infrastructure in one place. Add buildings, define room types, set capacities, and track availability.',
    icon: Building2,
    color: 'blue',
    illustration: BuildingIllustration,
    features: [
      { icon: Building2, text: 'Multiple buildings support' },
      { icon: LayoutGrid, text: 'Custom room types' },
      { icon: MousePointerClick, text: 'Easy drag & drop interface' },
    ],
  },
  {
    badge: 'Course Planning',
    title: 'Flexible Course Setup',
    description:
      'Define courses with multiple session types—lectures, labs, and tutorials. Specify duration, frequency, and room requirements.',
    icon: BookOpen,
    color: 'emerald',
    illustration: CourseIllustration,
    features: [
      { icon: BookOpen, text: 'Lectures, labs & tutorials' },
      { icon: Clock, text: 'Custom session durations' },
      { icon: LayoutGrid, text: 'Room type requirements' },
    ],
  },
  {
    badge: 'Visualization',
    title: 'Multiple Schedule Views',
    description:
      'View your schedule the way you need it—by week, by room, or by course. Export and share with your team.',
    icon: Calendar,
    color: 'amber',
    illustration: ViewsIllustration,
    features: [
      { icon: Calendar, text: 'Week, room & course views' },
      { icon: LayoutGrid, text: 'Interactive timetable' },
      { icon: MousePointerClick, text: 'Click to view details' },
    ],
  },
]

const colorClasses = {
  violet: {
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    dot: 'bg-violet-500',
  },
  blue: {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    dot: 'bg-blue-500',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    dot: 'bg-amber-500',
  },
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = slides[currentSlide]
  const colors = colorClasses[slide.color as keyof typeof colorClasses]
  const isLastSlide = currentSlide === slides.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      onOpenChange(false)
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden p-0 gap-0" showCloseButton={false}>
        {/* Header with badge and skip */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <Badge variant="outline" className={cn('text-xs', colors.badge)}>
            {slide.badge}
          </Badge>
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        </div>

        {/* Title and description */}
        <div className="px-6 pb-4">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {slide.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {slide.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Illustration */}
        <div className="px-6">
          <div className="rounded-lg border overflow-hidden">
            <slide.illustration />
          </div>
        </div>

        {/* Features List */}
        <div className="px-6 py-5 space-y-2.5">
          {slide.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={cn('rounded-lg p-1.5', colors.iconBg)}>
                <feature.icon className={cn('size-3.5', colors.iconColor)} />
              </div>
              <span className="text-sm text-muted-foreground">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0 flex-row items-center justify-between sm:justify-between border-t-0">
          {/* Dots indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'size-2 rounded-full transition-all',
                  index === currentSlide
                    ? colors.dot
                    : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} size="sm" className="gap-1">
              {isLastSlide ? (
                <>
                  Get Started
                  <Sparkles className="size-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
