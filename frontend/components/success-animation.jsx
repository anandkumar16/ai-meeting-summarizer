"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"

export function SuccessAnimation({
  show = false,
  title = "Success!",
  description = "Operation completed successfully",
  onComplete,
}) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onAnimationComplete={() => {
        setTimeout(() => onComplete?.(), 2000)
      }}
    >
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="glass p-8 rounded-2xl text-center max-w-sm mx-4">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
            <Check className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${50 + Math.cos((i * Math.PI) / 3) * 60}%`,
              top: `${50 + Math.sin((i * Math.PI) / 3) * 60}%`,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1, 0],
              rotate: 360,
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: 0.6 + i * 0.1,
              duration: 1.5,
              ease: "easeOut",
            }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
        ))}

        {/* Text */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="text-xl font-bold font-heading mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
