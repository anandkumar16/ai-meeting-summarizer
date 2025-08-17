"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function LoadingAnimation({ message = "Processing..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="text-muted-foreground"
      >
        {message}
      </motion.p>

      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
