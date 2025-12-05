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

  const handlePreloaderBComplete = () => {
    // Don't hide here - let usePageTransition handle it
    // This prevents double hiding and ensures proper timing
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PageTransitionWrapper: PreloaderB onComplete called, waiting for usePageTransition to hide')
    }
  }

  // Show immediate white screen blocker when navigating (even before PreloaderB renders)
  // This prevents any white screen flash during the gap between navigation start and preloader render
  const showWhiteBlocker = isNavigating && !isPreloaderBVisible

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
      {showWhiteBlocker && (
        <div 
          className="fixed inset-0 z-[99997] bg-white"
          style={{
            pointerEvents: 'auto'
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
      <div 
        style={{
          opacity: 1, // Always keep visible - preloader overlays on top
          pointerEvents: isNavigating ? 'none' : 'auto' // Disable interactions during navigation
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

