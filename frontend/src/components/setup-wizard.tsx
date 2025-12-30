import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Building2,
  Tag,
  DoorOpen,
  BookOpen,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  count: number
  required: boolean
  dependsOn?: string
}

interface SetupWizardProps {
  buildingsCount: number
  roomTypesCount: number
  roomsCount: number
  coursesCount: number
}

export function SetupWizard({
  buildingsCount,
  roomTypesCount,
  roomsCount,
  coursesCount,
}: SetupWizardProps) {
  const steps: SetupStep[] = [
    {
      id: 'buildings',
      title: 'Add Buildings',
      description: 'Create campus buildings where classes will be held',
      icon: Building2,
      href: '/app/buildings',
      count: buildingsCount,
      required: true,
    },
    {
      id: 'room-types',
      title: 'Define Room Types',
      description: 'Create categories like Lecture Hall, Lab, Tutorial Room',
      icon: Tag,
      href: '/app/room-types',
      count: roomTypesCount,
      required: true,
      dependsOn: 'buildings',
    },
    {
      id: 'rooms',
      title: 'Add Rooms',
      description: 'Add rooms to your buildings with their capacities',
      icon: DoorOpen,
      href: '/app/rooms',
      count: roomsCount,
      required: true,
      dependsOn: 'room-types',
    },
    {
      id: 'courses',
      title: 'Create Courses',
      description: 'Add courses and define their session requirements',
      icon: BookOpen,
      href: '/app/courses',
      count: coursesCount,
      required: true,
      dependsOn: 'rooms',
    },
  ]

  const completedSteps = steps.filter(step => step.count > 0).length
  const progress = (completedSteps / steps.length) * 100
  const allComplete = completedSteps === steps.length

  const getStepStatus = (step: SetupStep, index: number): 'complete' | 'current' | 'upcoming' | 'locked' => {
    if (step.count > 0) return 'complete'

    // Check if dependencies are met
    if (step.dependsOn) {
      const depStep = steps.find(s => s.id === step.dependsOn)
      if (depStep && depStep.count === 0) return 'locked'
    }

    // Find the first incomplete step
    const firstIncomplete = steps.findIndex(s => s.count === 0)
    if (index === firstIncomplete) return 'current'

    return 'upcoming'
  }

  if (allComplete) {
    return (
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2">
              <Check className="size-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Setup Complete!</CardTitle>
              <CardDescription>You're ready to generate your first schedule</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-4 gap-2">
              {steps.map((step) => (
                <div key={step.id} className="text-center p-2 rounded-lg bg-background/50">
                  <p className="text-lg font-bold">{step.count}</p>
                  <p className="text-xs text-muted-foreground">{step.title.replace('Add ', '').replace('Create ', '').replace('Define ', '')}</p>
                </div>
              ))}
            </div>
            <Button asChild size="lg">
              <Link to="/app/generate">
                <Sparkles className="mr-2 size-4" />
                Generate Schedule
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Get Started</CardTitle>
            <CardDescription>Complete these steps to generate your schedule</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{completedSteps} of {steps.length} complete</p>
            <Progress value={progress} className="w-32 h-2 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step, index)
            const StepIcon = step.icon

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors",
                  status === 'complete' && "bg-emerald-500/5",
                  status === 'current' && "bg-primary/5 ring-1 ring-primary/20",
                  status === 'upcoming' && "bg-muted/30",
                  status === 'locked' && "bg-muted/20 opacity-60"
                )}
              >
                {/* Step Number/Check */}
                <div className={cn(
                  "flex items-center justify-center size-8 rounded-full text-sm font-medium shrink-0",
                  status === 'complete' && "bg-emerald-500 text-white",
                  status === 'current' && "bg-primary text-primary-foreground",
                  status === 'upcoming' && "bg-muted text-muted-foreground",
                  status === 'locked' && "bg-muted text-muted-foreground"
                )}>
                  {status === 'complete' ? (
                    <Check className="size-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Icon */}
                <div className={cn(
                  "rounded-lg p-2 shrink-0",
                  status === 'complete' && "bg-emerald-500/10 text-emerald-500",
                  status === 'current' && "bg-primary/10 text-primary",
                  status === 'upcoming' && "bg-muted text-muted-foreground",
                  status === 'locked' && "bg-muted text-muted-foreground"
                )}>
                  <StepIcon className="size-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium text-sm",
                      status === 'locked' && "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    {step.count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({step.count} added)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {status === 'locked'
                      ? `Complete "${steps.find(s => s.id === step.dependsOn)?.title}" first`
                      : step.description
                    }
                  </p>
                </div>

                {/* Action */}
                {status !== 'locked' && (
                  <Button
                    variant={status === 'current' ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to={step.href}>
                      {status === 'complete' ? 'Manage' : 'Start'}
                      <ArrowRight className="ml-1 size-3" />
                    </Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick tip */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-dashed">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Follow the steps in order. Rooms need buildings and room types to be created first.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
