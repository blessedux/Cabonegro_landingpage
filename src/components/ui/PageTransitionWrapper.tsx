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
        console.log('🔄 PageTransitionWrapper: Pathname changed', {
          from: prevPathnameRef.current,
          to: pathname,
          isNavigating,
          isPreloaderBVisible
        })
      }
      prevPathnameRef.current = pathname
    }
  }, [pathname, isNavigating, isPreloaderBVisible])

  // Control white blocker visibility with timeout for fast transitions
  React.useEffect(() => {
    // Show white blocker when navigating and PreloaderB not visible yet
    if (isNavigating && !isPreloaderBVisible) {
      setShowWhiteBlocker(true)
      // Auto-hide after short timeout if PreloaderB doesn't appear (fast transition)
      // This handles project → home navigation where PreloaderB is skipped
      const timeout = setTimeout(() => {
        if (!isPreloaderBVisible) {
          setShowWhiteBlocker(false)
          if (process.env.NODE_ENV === 'development') {
            console.log('⚡ PageTransitionWrapper: White blocker auto-hide (fast transition detected)')
          }
        }
      }, 100) // Hide after 100ms if PreloaderB doesn't appear
      return () => clearTimeout(timeout)
    } else {
      // Hide immediately when PreloaderB appears or navigation completes
      setShowWhiteBlocker(false)
    }
  }, [isNavigating, isPreloaderBVisible])

  const handlePreloaderBComplete = () => {
    // Don't hide here - let usePageTransition handle it
    // This prevents double hiding and ensures proper timing
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PageTransitionWrapper: PreloaderB onComplete called, waiting for usePageTransition to hide')
    }
  }

  if (process.env.NODE_ENV === 'development' && isNavigating) {
    console.log('🎬 PageTransitionWrapper render:', {
      isNavigating,
      isPreloaderBVisible,
      showWhiteBlocker,
      pathname
    })
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

      {/* Show preloader during navigation ONLY (not first load) */}
      {/* z-index 99999 ensures it overlays everything including navbar and white blocker */}
      {/* LocaleHomePage handles first load preloader separately */}
      {isPreloaderBVisible && isNavigating && (
        <PreloaderB 
          key={`preloader-nav-${pathname}`} // Unique key per route to ensure proper remounting
          onComplete={handlePreloaderBComplete}
          duration={0.5}
          shouldAutoHide={true} // Enable auto-hide as fallback if hidePreloaderB() isn't called
        />
      )}
      
      {/* Keep children visible during transition - overlay preloader on top */}
      {/* This ensures old page stays visible until new page is ready, preventing white screens */}
      {/* CRITICAL: Re-enable pointer events as soon as navigation completes to allow navbar clicks */}
      {/* IMPORTANT: Don't block pointer events - let buttons and links work immediately */}
      <div 
        style={{
          opacity: 1, // Always keep visible - preloader overlays on top
          pointerEvents: 'auto' // Always allow interactions - preloader is just a visual overlay
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

