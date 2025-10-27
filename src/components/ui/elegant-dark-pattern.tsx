import type React from "react"
import { cn } from "@/lib/utils"

interface DarkGradientBgProps {
  children?: React.ReactNode
  className?: string
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", className)}>
      {/* Base gradient background */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: 'radial-gradient(100% 100% at 0% 0%, rgb(46, 46, 46) 0%, rgb(0, 0, 0) 100%)',
          mask: 'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      {/* Texture pattern */}
      <div
        className="absolute inset-0 opacity-5 bg-repeat"
        style={{
          backgroundImage: 'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
          backgroundSize: '149.76px'
        }}
      />
      
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Subtle radial highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
