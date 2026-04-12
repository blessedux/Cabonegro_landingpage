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
  const { isPreloaderBVisible, hidePreloaderB, isNavigating, showPreloaderB, setNavigating } = usePreloader()
  usePageTransition() // This hook detects route changes and triggers preloader

  // Track previous pathname to detect navigation
  const prevPathnameRef = React.useRef(pathname)
  const isTransitioning = React.useRef(false)
  const [showWhiteBlocker, setShowWhiteBlocker] = React.useState(false)

  // CRITICAL FIX: Fallback detection - ensure preloader shows on ANY pathname change
  // This handles cases where navigation handlers didn't trigger preloader
  // (e.g., direct URL navigation, browser back/forward, external links)
  React.useEffect(() => {
    const pathnameChanged = prevPathnameRef.current !== pathname
    
    if (pathnameChanged) {
      isTransitioning.current = true
      
      // CRITICAL: If preloader isn't visible and navigation isn't set, show it immediately
      // This is a fallback to ensure preloader ALWAYS shows during navigation
      if (!isPreloaderBVisible && !isNavigating) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏱️ [PERF] Fallback: Showing preloader on pathname change', {
            from: prevPathnameRef.current,
            to: pathname
          })
        }
        // Ensure preloader shows - this is a safety mechanism
        showPreloaderB()
        setNavigating(true)
      }
      
      // CRITICAL: Show white blocker immediately on pathname change
      // Don't wait for isNavigating flag - show immediately to prevent blank screen
      setShowWhiteBlocker(true)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('⏱️ [PERF] Pathname changed', {
          from: prevPathnameRef.current,
          to: pathname,
          isPreloaderBVisible,
          isNavigating
        })
      }
      prevPathnameRef.current = pathname
    }
  }, [pathname, isNavigating, isPreloaderBVisible, showPreloaderB, setNavigating])

  // Control white blocker visibility - hide when preloader appears
  // CRITICAL: White blocker shows immediately on pathname change (handled above)
  // This effect just hides it when preloader appears
  React.useEffect(() => {
    // Hide white blocker when preloader appears (with small delay for smooth transition)
    if (isPreloaderBVisible && showWhiteBlocker) {
      // Small delay to ensure smooth transition
      const timeout = setTimeout(() => {
        setShowWhiteBlocker(false)
      }, 50)
      return () => clearTimeout(timeout)
    }
    
    // Hide when navigation completes
    if (!isNavigating && !isPreloaderBVisible) {
      setShowWhiteBlocker(false)
    }
  }, [isNavigating, isPreloaderBVisible, showWhiteBlocker])

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

      {/* Show preloader during navigation - CRITICAL: Show when navigating OR preloader visible */}
      {/* z-index 99999 ensures it overlays everything including navbar and white blocker */}
      {/* LocaleHomePage handles first load preloader separately */}
      {/* CRITICAL: Show if navigating OR if preloader is visible (fallback) */}
      {(isNavigating || isPreloaderBVisible) && (
        <PreloaderB 
          key={`preloader-nav-${pathname}`} // Unique key per route to ensure proper remounting
          onComplete={handlePreloaderBComplete}
          duration={0.5}
          shouldAutoHide={false} // Don't auto-hide - let usePageTransition control it
        />
      )}
      
      {/* CRITICAL: Hide old page when navigating - white blocker/preloader covers it */}
      {/* White blocker shows immediately, then preloader appears */}
      {/* Show content only when NOT navigating AND preloader not visible */}
      <div 
        style={{
          opacity: (isNavigating || isPreloaderBVisible) ? 0 : 1, // Hide old page when navigating or preloader visible
          transition: 'opacity 0.2s ease-out', // Smooth fade out
          pointerEvents: (isNavigating || isPreloaderBVisible) ? 'none' : 'auto' // Block interactions when navigating
        }}
      >
        {/* Wrap children in Suspense to prevent white screen during route transitions */}
        {/* Show LoadingFallback if navigating OR preloader visible (fallback for slow loads) */}
        <Suspense fallback={(isNavigating || isPreloaderBVisible) ? <LoadingFallback /> : null}>
          {children}
        </Suspense>
      </div>
    </>
  )
}

