"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function LoadingSkeleton({ className, ...props }) {
  return (
    <motion.div
      className={cn("bg-muted/50 rounded-md", className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      {...props}
    />
  )
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton key={i} className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={cn("glass p-6 space-y-4", className)}>
      <LoadingSkeleton className="h-6 w-1/3" />
      <SkeletonText lines={3} />
      <div className="flex space-x-2">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  )
}
