import type React from "react"
import { cn } from "@/lib/utils"

interface DarkGradientBgProps {
  children?: React.ReactNode
  className?: string
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-white", className)}>
      {/* Base gradient background - light mode */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: 'radial-gradient(100% 100% at 0% 0%, rgb(250, 250, 250) 0%, rgb(255, 255, 255) 100%)',
          mask: 'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      {/* Texture pattern - subtle for light mode */}
      <div
        className="absolute inset-0 opacity-3 bg-repeat"
        style={{
          backgroundImage: 'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
          backgroundSize: '149.76px'
        }}
      />
      
      {/* Subtle dot pattern overlay - light mode */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(54, 95, 148, 0.1) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Subtle radial highlight - light mode with accent blue */}
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
