'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
  inline?: boolean // If true, uses absolute positioning instead of fixed
  shouldAutoHide?: boolean // If false, preloader waits for explicit hide signal (default: false for language switches)
}

export default function PreloaderB({ onComplete, duration = 0.8, className = '', inline = false, shouldAutoHide = false }: PreloaderBProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [shimmerPosition, setShimmerPosition] = useState(-100) // For skeleton shimmer effect
  const mountTimeRef = useRef<number>(Date.now())
  const hasStartedFadeOutRef = useRef(false)
  const animationFrameRef = useRef<number>()

  // Reset state when component mounts or becomes visible again
  useEffect(() => {
    setIsVisible(true)
    setIsFadingOut(false)
    hasStartedFadeOutRef.current = false
    mountTimeRef.current = Date.now()
    setShimmerPosition(-100) // Start shimmer off-screen
  }, [])

  // Skeleton shimmer animation - smooth left-to-right shimmer effect
  // Keep shimmer running until component is completely removed (isVisible = false)
  useEffect(() => {
    if (!isVisible) {
      // Stop animation only when component is completely removed
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
        if (process.env.NODE_ENV === 'development') {
          console.log('✨ Shimmer animation started')
        }
      }
      const elapsed = timestamp - startTime
      
      // Shimmer moves from -80% to 180% over 1.2 seconds, then loops
      // Faster animation for better visibility
      const cycle = (elapsed / 1200) % 1
      const position = -80 + (cycle * 260) // -80% to 180% for full sweep
      setShimmerPosition(position)
      
      if (isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎬 PreloaderB mounted - duration: ${duration}s, inline: ${inline}, shouldAutoHide: ${shouldAutoHide}`)
    }
    
    // For inline mode, ensure minimum 2 seconds of visibility before allowing fade out
    if (inline) {
      const minDisplayTime = 2000 // 2 seconds minimum
      const elapsed = Date.now() - mountTimeRef.current
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      // After minimum time passes, component can be removed by parent
      return
    }
    
    // Only auto-hide if shouldAutoHide is true
    // For language switches, shouldAutoHide is false, so preloader waits for explicit hide
    if (!shouldAutoHide) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏸️ PreloaderB: Auto-hide disabled, waiting for explicit hide signal')
      }
      // Don't set up auto-hide timer - parent will control when to hide
      // Only set up safety timer to prevent getting stuck
      const maxDuration = 5000 // 5 seconds max safety timer
      const safetyTimer = setTimeout(() => {
        if (!hasStartedFadeOutRef.current && onComplete) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ PreloaderB: Safety timer triggered after 5s - calling onComplete')
          }
          // Call onComplete but don't hide - let parent decide
          requestAnimationFrame(() => {
            if (onComplete) {
              onComplete()
            }
          })
        }
      }, maxDuration)
      
      return () => {
        clearTimeout(safetyTimer)
      }
    }
    
    // Auto-hide mode: ensure minimum display time for smooth transition
    // Then fade out smoothly - this ensures users see the transition
    const minDisplayTime = 500 // Minimum 500ms to ensure smooth transition and prevent double pop-up
    const displayDuration = Math.max(minDisplayTime, duration * 1000)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ PreloaderB will fade out after ${displayDuration}ms (auto-hide mode)`)
    }
    
    const fadeOutTimer = setTimeout(() => {
      if (hasStartedFadeOutRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ PreloaderB: Fade out already started, skipping')
        }
        return // Prevent double fade out
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 PreloaderB: Starting fade out (auto-hide)')
      }
      hasStartedFadeOutRef.current = true
      setIsFadingOut(true)
      
      // Complete after fade out animation
      // Background fades out, but logo stays visible until component is removed
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ PreloaderB: Fade out complete, calling onComplete')
        }
        // Only remove component (and logo) after background has fully faded
        setIsVisible(false)
        // Ensure onComplete is called - use a small delay to ensure state updates
        if (onComplete) {
          // Use requestAnimationFrame to ensure state has updated
          requestAnimationFrame(() => {
            onComplete()
          })
        }
      }, 400) // Smooth fade out (400ms) - logo stays visible during this time
    }, displayDuration)

    // Safety mechanism: Force completion after maximum time to prevent getting stuck
    const maxDuration = Math.max(3000, (duration * 1000) + 1000) // Maximum: duration + 1s buffer (min 3s)
    const safetyTimer = setTimeout(() => {
      if (!hasStartedFadeOutRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ PreloaderB: Safety timer triggered - forcing completion')
        }
        hasStartedFadeOutRef.current = true
        setIsFadingOut(true)
        setTimeout(() => {
          setIsVisible(false)
          // Ensure onComplete is called
          if (onComplete) {
            requestAnimationFrame(() => {
              onComplete()
            })
          }
        }, 200)
      }
    }, maxDuration)

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(safetyTimer)
    }
  }, [duration, onComplete, inline, shouldAutoHide])

  if (!isVisible) return null

  return (
    <>
      {/* Background layer - fades out independently */}
      <div
        className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} bg-white transition-opacity duration-400 ease-out ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{ 
          backgroundColor: '#ffffff', // White background to match original preloader
          zIndex: 99999, // Ensure it's above everything including navbar and Stats section
          pointerEvents: isFadingOut ? 'none' : 'auto', // Allow interactions when fading out
          position: 'fixed', // Always fixed to block content
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* Subtle circular gradient overlay for 3D effect */}
        {/* Darker white on borders, brighter white in center */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.98) 30%, rgba(255, 255, 255, 0.95) 60%, rgba(250, 250, 250, 0.92) 100%)',
            opacity: isFadingOut ? 0 : 1, // Fade with background
            transition: 'opacity 400ms ease-out',
          }}
        />
      </div>
      
      {/* Logo layer - stays visible until component is removed */}
      {/* Positioned separately so it doesn't fade with background */}
      <div
        className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} flex items-center justify-center pointer-events-none`}
        style={{ 
          zIndex: 100000, // Above background layer
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 1, // Always fully visible - never fades
        }}
      >
        {/* Centered logo with skeleton shimmer animation */}
        {/* Logo stays visible until preloader is completely removed - no fade out */}
        <div
          className="relative"
          style={{ 
            opacity: 1, // Always visible - don't fade out logo
            transform: 'scale(1)', // Keep scale constant
          }}
        >
          <div className="flex items-center justify-center relative">
            {/* Logo container with skeleton shimmer overlay */}
            <div className="relative" style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Black logo with shimmer effect */}
              <div className="relative overflow-hidden" style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  src="/cabonegro_logo.png"
                  alt="Cabo Negro"
                  width={200}
                  height={200}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain relative z-10"
                  priority
                  quality={100}
                  unoptimized={false}
                  style={{
                    filter: 'brightness(0)', // Convert to black to match original preloader
                    WebkitFilter: 'brightness(0)', // Safari support
                  }}
                />
                {/* Skeleton shimmer overlay - visible shimmer that sweeps across the logo */}
                {/* Keep shimmer animation running until preloader is removed */}
                <div
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    overflow: 'hidden',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%', // Match logo shape
                  }}
                >
                  {/* Shimmer bar that moves across - highly visible skeleton effect */}
                  {/* Using bright white gradient for maximum visibility on black logo */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: `${shimmerPosition}%`,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.2) 20%,
                        rgba(255, 255, 255, 0.6) 40%,
                        rgba(255, 255, 255, 1) 50%,
                        rgba(255, 255, 255, 0.6) 60%,
                        rgba(255, 255, 255, 0.2) 80%,
                        transparent 100%
                      )`,
                      transform: 'skewX(-20deg)',
                      mixBlendMode: 'lighten', // Lighten mode works better on black
                      opacity: 1,
                      willChange: 'left', // Optimize for animation
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
