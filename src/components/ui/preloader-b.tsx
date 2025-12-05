'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
  inline?: boolean // If true, uses absolute positioning instead of fixed
}

export default function PreloaderB({ onComplete, duration = 0.8, className = '', inline = false }: PreloaderBProps) {
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
  useEffect(() => {
    if (isFadingOut) {
      // Stop animation when fading out
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
      
      if (!isFadingOut) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isFadingOut])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎬 PreloaderB mounted - duration: ${duration}s, inline: ${inline}`)
    }
    
    // For inline mode, ensure minimum 2 seconds of visibility before allowing fade out
    if (inline) {
      const minDisplayTime = 2000 // 2 seconds minimum
      const elapsed = Date.now() - mountTimeRef.current
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      // After minimum time passes, component can be removed by parent
      return
    }
    
    // For full-screen mode, ensure minimum display time for smooth transition
    // Then fade out smoothly - this ensures users see the transition
    const minDisplayTime = 500 // Minimum 500ms to ensure smooth transition and prevent double pop-up
    const displayDuration = Math.max(minDisplayTime, duration * 1000)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ PreloaderB will fade out after ${displayDuration}ms`)
    }
    
    const fadeOutTimer = setTimeout(() => {
      if (hasStartedFadeOutRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ PreloaderB: Fade out already started, skipping')
        }
        return // Prevent double fade out
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎭 PreloaderB: Starting fade out')
      }
      hasStartedFadeOutRef.current = true
      setIsFadingOut(true)
      
      // Complete after fade out animation
      setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ PreloaderB: Fade out complete, calling onComplete')
        }
        setIsVisible(false)
        // Ensure onComplete is called - use a small delay to ensure state updates
        if (onComplete) {
          // Use requestAnimationFrame to ensure state has updated
          requestAnimationFrame(() => {
            onComplete()
          })
        }
      }, 300) // Smooth fade out (300ms)
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
  }, [duration, onComplete, inline])

  if (!isVisible) return null

  return (
    <div
      className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} bg-white flex items-center justify-center transition-opacity duration-400 ease-out ${
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
      {/* Centered logo with skeleton shimmer animation */}
      <div
        className={`relative transition-opacity duration-400 ease-out ${
          isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ transition: 'opacity 400ms ease-out, transform 400ms ease-out' }}
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
  )
}
