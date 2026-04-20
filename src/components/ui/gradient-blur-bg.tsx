'use client'

import { cn } from "@/lib/utils"

interface GradientBlurBgProps {
  className?: string
  height?: string
  variant?: 'top' | 'bottom' | 'both'
}

export function GradientBlurBg({ 
  className, 
  height = "200vh",
  variant = 'top'
}: GradientBlurBgProps) {
  // Determine gradient based on variant
  const getGradient = () => {
    switch (variant) {
      case 'top':
        // Radial gradient from top (indigo) - for Hero section
        return "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)"
      case 'bottom':
        // Radial gradient from bottom (slate) - for AboutUs section
        return "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)"
      case 'both':
        // For both sections spanning 200vh: use top gradient which works well across full height
        // The gradient naturally transitions from white at top to indigo, visible in both Hero and AboutUs
        return "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)"
      default:
        return "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)"
    }
  }

  return (
    <div 
      className={cn("pointer-events-none relative", className)}
      style={{
        height,
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1, // Behind all content (Hero zIndex: 1, AboutUs zIndex: 1, Navbar zIndex: 100)
      }}
    >
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: getGradient(),
        }}
      />
    </div>
  )
}

export default GradientBlurBg
