"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProgressIndicator({ steps, currentStep, onStepClick }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = index < currentIndex
        const isClickable = index <= currentIndex

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground shadow-lg",
                  isCompleted && "bg-secondary text-secondary-foreground",
                  !isActive && !isCompleted && "text-muted-foreground hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive && "bg-primary-foreground text-primary",
                    isCompleted && "bg-secondary-foreground text-secondary",
                    !isActive && !isCompleted && "border-2 border-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className="font-medium">{step.label}</span>
              </Button>
            </motion.div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-2 transition-all duration-300",
                  index < currentIndex ? "bg-secondary" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
