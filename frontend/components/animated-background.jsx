"use client"

import { motion } from "framer-motion"
import { FloatingParticles } from "./floating-particles"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles count={30} />
    </div>
  )
}
