import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowProps {
  children?: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
  color?: "cyan" | "blue" | "white"
}

export function Glow({ 
  children, 
  className, 
  intensity = "medium",
  color = "cyan" 
}: GlowProps) {
  const getIntensityClasses = () => {
    switch (intensity) {
      case "low":
        return {
          main: "opacity-60 blur-3xl",
          secondary: "opacity-40 blur-2xl",
          tertiary: "opacity-20 blur-xl"
        }
      case "high":
        return {
          main: "opacity-95 blur-3xl",
          secondary: "opacity-80 blur-2xl", 
          tertiary: "opacity-50 blur-xl"
        }
      default: // medium
        return {
          main: "opacity-85 blur-3xl",
          secondary: "opacity-60 blur-2xl",
          tertiary: "opacity-35 blur-xl"
        }
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return {
          main: "bg-blue-400/80",
          secondary: "bg-blue-300/60",
          tertiary: "bg-blue-200/40"
        }
      case "white":
        return {
          main: "bg-white/80",
          secondary: "bg-white/60", 
          tertiary: "bg-white/40"
        }
      default: // cyan
        return {
          main: "bg-cyan-400/80",
          secondary: "bg-cyan-300/60",
          tertiary: "bg-cyan-200/40"
        }
    }
  }

  const intensityClasses = getIntensityClasses()
  const colorClasses = getColorClasses()

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Base background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Single centered glowing sphere */}
      <div className="absolute inset-0 flex items-center justify-center translate-y-[50%] translate-x-[30%]">
        <motion.div
          className="h-[64rem] w-[64rem] rounded-full"
          animate={{
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(0, 207, 255, 1) 0%, rgba(0, 207, 255, 0.95) 15%, rgba(0, 207, 255, 0.85) 30%, rgba(0, 207, 255, 0.7) 50%, rgba(0, 207, 255, 0.5) 70%, rgba(0, 207, 255, 0.2) 85%, rgba(0, 207, 255, 0) 100%)',
            filter: 'blur(3rem)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
