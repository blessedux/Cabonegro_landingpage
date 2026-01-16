'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import PreloaderB from '@/components/ui/preloader-b'
import { usePageTransition } from '@/hooks/usePageTransition'

// Minimal loading fallback to prevent white screen
function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-[99998] bg-white flex items-center justify-center">
      <div className="relative">
        <img
          src="/cabonegro_logo.png"
          alt="Cabo Negro"
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-80"
          style={{
            filter: 'brightness(0)', // Convert to black to match preloader
          }}
        />
      </div>
    </div>
  )
}

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isPreloaderBVisible, hidePreloaderB, isNavigating } = usePreloader()
  usePageTransition() // This hook detects route changes and triggers preloader

  // Track previous pathname to detect navigation
  const prevPathnameRef = React.useRef(pathname)
  const isTransitioning = React.useRef(false)
  const [showWhiteBlocker, setShowWhiteBlocker] = React.useState(false)

  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      isTransitioning.current = true
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ [PERF] Pathname changed', {
          from: prevPathnameRef.current,
          to: pathname
        })
      }
      prevPathnameRef.current = pathname
    }
  }, [pathname, isNavigating, isPreloaderBVisible])

  // Control white blocker visibility - show immediately when navigating
  React.useEffect(() => {
    // Show white blocker immediately when navigation starts
    // This prevents blank screen while preloader loads
    if (isNavigating) {
      setShowWhiteBlocker(true)
      // Hide when preloader appears
      if (isPreloaderBVisible) {
        // Small delay to ensure smooth transition
        const timeout = setTimeout(() => {
          setShowWhiteBlocker(false)
        }, 50)
        return () => clearTimeout(timeout)
      }
    } else {
      // Hide when navigation completes
      setShowWhiteBlocker(false)
    }
  }, [isNavigating, isPreloaderBVisible])

  const handlePreloaderBComplete = () => {
    // Don't hide here - let usePageTransition handle it
    // This prevents double hiding and ensures proper timing
  }

  return (
    <>
      {/* Immediate white screen blocker - shows instantly when navigation starts */}
      {/* This prevents white screen during the gap before PreloaderB renders */}
      {/* CRITICAL: Must hide when navigation completes to prevent blocking navbar */}
      {showWhiteBlocker && (
        <div 
          className="fixed inset-0 z-[99997] bg-white transition-opacity duration-200"
          style={{
            pointerEvents: showWhiteBlocker ? 'auto' : 'none', // Only block when actually showing
            opacity: showWhiteBlocker ? 1 : 0,
            visibility: showWhiteBlocker ? 'visible' : 'hidden' // Completely remove from interaction when hidden
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/cabonegro_logo.png"
              alt="Cabo Negro"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-80"
              style={{
                filter: 'brightness(0)', // Convert to black to match preloader
              }}
            />
          </div>
        </div>
      )}

      {/* Show preloader during navigation - CRITICAL: Show when navigating */}
      {/* z-index 99999 ensures it overlays everything including navbar and white blocker */}
      {/* LocaleHomePage handles first load preloader separately */}
      {isNavigating && (
        <PreloaderB 
          key={`preloader-nav-${pathname}`} // Unique key per route to ensure proper remounting
          onComplete={handlePreloaderBComplete}
          duration={0.5}
          shouldAutoHide={false} // Don't auto-hide - let usePageTransition control it
        />
      )}
      
      {/* CRITICAL: Hide old page when navigating - white blocker/preloader covers it */}
      {/* White blocker shows immediately, then preloader appears */}
      <div 
        style={{
          opacity: isNavigating ? 0 : 1, // Hide old page when navigating (white blocker/preloader covers it)
          transition: 'opacity 0.2s ease-out', // Smooth fade out
          pointerEvents: isNavigating ? 'none' : 'auto' // Block interactions when navigating
        }}
      >
        {/* Wrap children in Suspense to prevent white screen during route transitions */}
        {/* Show LoadingFallback only if navigating and Suspense is triggered */}
        <Suspense fallback={isNavigating ? <LoadingFallback /> : null}>
          {children}
        </Suspense>
      </div>
    </>
  )
}

