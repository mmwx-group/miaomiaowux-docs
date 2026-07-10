import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
  className?: string
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <div key={index} className='flex items-center'>
            {/* Step circle */}
            <div
              className={cn(
                'flex items-center justify-center size-8 rounded-full text-sm font-medium transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                isPending && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? <Check className='size-4' /> : index + 1}
            </div>

            {/* Label */}
            {labels && labels[index] && (
              <span
                className={cn(
                  'ml-2 text-sm hidden sm:inline',
                  isCurrent && 'font-medium text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {labels[index]}
              </span>
            )}

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-0.5 mx-2',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
