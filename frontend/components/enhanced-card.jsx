"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function EnhancedCard({ children, className, hover = true, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "glass transition-all duration-300 border-border/50",
          hover && "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
          glow && "shadow-lg shadow-primary/20",
          className,
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg pointer-events-none" />

        <div className="relative">{children}</div>
      </Card>
    </motion.div>
  )
}
