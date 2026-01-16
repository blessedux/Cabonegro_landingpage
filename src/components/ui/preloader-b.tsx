'use client'

import { useEffect, useState, useRef } from 'react'

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
  const mountTimeRef = useRef<number>(Date.now())
  const hasStartedFadeOutRef = useRef(false)

  // Reset state when component mounts or becomes visible again
  useEffect(() => {
    setIsVisible(true)
    setIsFadingOut(false)
    hasStartedFadeOutRef.current = false
    mountTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    
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
      // Don't set up auto-hide timer - parent will control when to hide
      // Only set up safety timer to prevent getting stuck
      const maxDuration = 5000 // 5 seconds max safety timer
      const safetyTimer = setTimeout(() => {
        if (!hasStartedFadeOutRef.current && onComplete) {
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
    const minDisplayTime = 200 // Reduced from 500ms to 200ms for faster navigation transitions
    const displayDuration = Math.max(minDisplayTime, duration * 1000)
    
    const fadeOutTimer = setTimeout(() => {
      if (hasStartedFadeOutRef.current) {
        return // Prevent double fade out
      }
      hasStartedFadeOutRef.current = true
      setIsFadingOut(true)
      
      // Complete after fade out animation
      // Video and background fade out together for smooth crossfade
      setTimeout(() => {
        // Only remove component after video has fully faded
        setIsVisible(false)
        // Ensure onComplete is called - use a small delay to ensure state updates
        if (onComplete) {
          // Use requestAnimationFrame to ensure state has updated
          requestAnimationFrame(() => {
            onComplete()
          })
        }
      }, 1000) // Smooth fade out (1000ms) - matches transition duration
    }, displayDuration)

    // Safety mechanism: Force completion after maximum time to prevent getting stuck
    const maxDuration = Math.max(3000, (duration * 1000) + 1000) // Maximum: duration + 1s buffer (min 3s)
    const safetyTimer = setTimeout(() => {
      if (!hasStartedFadeOutRef.current) {
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
        }, 1000) // Match fade out duration
      }
    }, maxDuration)

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(safetyTimer)
    }
  }, [duration, onComplete, inline, shouldAutoHide])

  // Completely remove from DOM when not visible to prevent any overlay
  if (!isVisible || isFadingOut) return null

  return (
    <>
      {/* Background layer - fades out smoothly for crossfade */}
      <div
        className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} bg-white transition-opacity duration-1000 ease-in-out ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{ 
          backgroundColor: '#ffffff', // White background to match original preloader
          zIndex: 99999, // Ensure it's above everything including navbar and Stats section
          pointerEvents: (isFadingOut || !isVisible) ? 'none' : 'auto', // Disable pointer events when fading out or not visible
          position: 'fixed', // Always fixed to block content
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Keep visible during fade-out for smooth transition (only hide when fully invisible)
          visibility: !isVisible ? 'hidden' : 'visible',
          // Keep display block during fade-out for smooth transition
          display: !isVisible ? 'none' : 'block'
        }}
      >
        {/* Subtle circular gradient overlay for 3D effect */}
        {/* Darker white on borders, brighter white in center */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.98) 30%, rgba(255, 255, 255, 0.95) 60%, rgba(250, 250, 250, 0.92) 100%)',
            opacity: isFadingOut ? 0 : 1, // Fade with background
            transition: 'opacity 1000ms ease-in-out',
          }}
        />
      </div>
      
      {/* Video layer - fades out smoothly for crossfade */}
      <div
        className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} flex items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out`}
        style={{ 
          zIndex: 100000, // Above background layer
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isFadingOut ? 0 : 1, // Fade out smoothly
        }}
      >
        {/* Centered video */}
        <div
          className="relative"
          style={{ 
            opacity: isFadingOut ? 0 : 1, // Fade out smoothly
            transform: isFadingOut ? 'scale(0.98)' : 'scale(1)', // Slight scale down on fade
            transition: 'opacity 1000ms ease-in-out, transform 1000ms ease-in-out',
          }}
        >
          <div className="flex items-center justify-center relative w-full h-full">
            {/* Centered video */}
            <div className="relative" style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                style={{
                  maxWidth: '800px',
                  maxHeight: '600px',
                  width: 'auto',
                  height: 'auto',
                }}
              >
                <source src="/globe_480p_preloader.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
