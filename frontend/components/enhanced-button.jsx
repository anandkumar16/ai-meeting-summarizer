"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EnhancedButton({
  children,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          variant === "default" &&
            "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl",
          variant === "outline" && "glass bg-transparent hover:bg-white/10 border-border/50 hover:border-primary/50",
          variant === "ghost" && "hover:bg-white/10 hover:backdrop-blur-sm",
          loading && "cursor-not-allowed opacity-70",
          className,
        )}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer Effect */}
        {!disabled && (
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ translateX: ["100%", "100%", "-100%", "-100%"] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              times: [0, 0.5, 0.6, 1],
            }}
          />
        )}

        <div className="relative flex items-center space-x-2">
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          )}
          {icon && !loading && icon}
          <span>{children}</span>
        </div>
      </Button>
    </motion.div>
  )
}
