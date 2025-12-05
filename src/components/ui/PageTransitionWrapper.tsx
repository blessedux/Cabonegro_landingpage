'use client'

import { Suspense } from 'react'
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

  const handlePreloaderBComplete = () => {
    // Don't hide here - let usePageTransition handle it
    // This prevents double hiding and ensures proper timing
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PageTransitionWrapper: PreloaderB onComplete called, waiting for usePageTransition to hide')
    }
  }

  return (
    <>
      {/* Show preloader during navigation ONLY (not first load) */}
      {/* z-index 99999 ensures it overlays everything including navbar */}
      {/* LocaleHomePage handles first load preloader separately */}
      {isPreloaderBVisible && isNavigating && (
        <PreloaderB 
          key={`preloader-nav-${pathname}`} // Unique key per route to ensure proper remounting
          onComplete={handlePreloaderBComplete}
          duration={0.5}
        />
      )}
      
      {/* Show loading fallback ONLY if navigating but preloader not visible yet AND we're not on homescreen */}
      {/* Don't show LoadingFallback on homescreen to prevent double logo issue */}
      {/* Homescreen pathname is like "/en", "/es", "/zh", "/fr" */}
      {isNavigating && !isPreloaderBVisible && pathname !== '/en' && pathname !== '/es' && pathname !== '/zh' && pathname !== '/fr' && <LoadingFallback />}
      
      {/* Wrap children in Suspense to prevent white screen during route transitions */}
      {/* Use null fallback for homescreen to prevent LoadingFallback from showing */}
      <Suspense fallback={(pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr') ? null : <LoadingFallback />}>
        {children}
      </Suspense>
    </>
  )
}

