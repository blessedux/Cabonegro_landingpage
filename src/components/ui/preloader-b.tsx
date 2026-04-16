'use client'

import { useEffect, useState, useRef } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import PreloaderGlobeVideo from '@/components/ui/PreloaderGlobeVideo'
import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'
import PreloaderTopographicCenterBlur from '@/components/ui/PreloaderTopographicCenterBlur'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
  inline?: boolean // If true, uses absolute positioning instead of fixed
  shouldAutoHide?: boolean // If false, preloader waits for explicit hide signal (default: false for language switches)
  globeSpin?: 'east' | 'west'
  /** Hydration boot: show full topo + globe, skip internal timers (parent hides overlay). */
  bootOnly?: boolean
  /** Pause video globe (CSS ring spinner remains). */
  suspended?: boolean
}

export default function PreloaderB({
  onComplete,
  duration = 0.8,
  className = '',
  inline = false,
  shouldAutoHide = false,
  globeSpin = 'west',
  bootOnly = false,
  suspended = false,
}: PreloaderBProps) {
  const { preloaderDrainHeavy } = usePreloader()
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
    if (bootOnly) return

    // For inline mode, ensure minimum 2 seconds of visibility before allowing fade out
    if (inline) {
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
  }, [bootOnly, duration, onComplete, inline, shouldAutoHide])

  // CRITICAL: Keep component in DOM during fade-out to prevent white gaps
  // Only remove when fully invisible (opacity 0 AND animation complete)
  // This ensures smooth crossfade with content
  if (!isVisible && !isFadingOut) return null

  return (
    <>
      <div
        className={`preloader-b-surface ${preloaderDrainHeavy ? 'preloader-b-drain-heavy' : ''} ${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[100003]'} bg-white transition-opacity duration-1000 ease-in-out ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{ 
          backgroundColor: '#ffffff', // White background to match original preloader
          zIndex: 100003, // Above fixed navbar (100000) so full-screen topo + globe cover chrome while loading
          pointerEvents: (isFadingOut || !isVisible) ? 'none' : 'auto', // Disable pointer events when fading out or not visible
          position: 'fixed', // Always fixed to block content
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Keep visible during fade-out for smooth transition (only hide when fully invisible)
          visibility: (!isVisible && !isFadingOut) ? 'hidden' : 'visible',
          // Keep display block during fade-out for smooth transition
          display: (!isVisible && !isFadingOut) ? 'none' : 'block'
        }}
      >
        <PreloaderTopographicBackdrop isFadingOut={isFadingOut} pauseLineAnimation={preloaderDrainHeavy} />
        <PreloaderTopographicCenterBlur isFadingOut={isFadingOut} />
        {/* Light vignette only — avoid opaque white over topo (was hiding contour lines) */}
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 72%)',
            opacity: isFadingOut ? 0 : 1,
            transition: 'opacity 1000ms ease-in-out',
          }}
        />
        <div className="absolute inset-0 z-[40] flex items-center justify-center">
          <div
            className="relative z-[50] w-full px-6 sm:px-10 max-w-2xl transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isFadingOut ? 0 : 1 }}
          >
            <PreloaderGlobeVideo globeSpin={globeSpin} suspended={suspended || preloaderDrainHeavy || isFadingOut} />
            <p className="mt-10 text-center text-xs sm:text-sm uppercase tracking-[0.24em] text-black/70">
              Loading Cabo Negro
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
