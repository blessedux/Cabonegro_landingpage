'use client'

import React, { Suspense } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { commitClientPathname } from '@/lib/client-pathname-sync'
import PreloaderB from '@/components/ui/preloader-b'
import { DeferredHomeWhileOverlay } from '@/components/ui/DeferredHomeWhileOverlay'
import { usePageTransition } from '@/hooks/usePageTransition'
import { usePrefetchAlternateLocales } from '@/hooks/usePrefetchAlternateLocales'

// Suspense fallback when a route segment is still loading (chunks)
function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-[100002] bg-white flex items-center justify-center pointer-events-none">
      <div className="relative">
        <img
          src="/cabonegro_logo.png"
          alt=""
          className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-80"
          style={{
            filter: 'brightness(0)',
          }}
        />
      </div>
    </div>
  )
}

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Client-only: avoids mutating shared module state during SSR (and keeps child reads in sync on hydrate).
  if (typeof window !== 'undefined') {
    commitClientPathname(pathname)
  }

  const isExplorePage = pathname.includes('/explore')

  const {
    isPreloaderBVisible,
    isNavigating,
    isBootLayoutDone,
    hasSeenPreloader,
    hidePreloaderB,
    setNavigating,
  } = usePreloader()

  /** Pathname-driven hide/show is centralized in usePageTransition only (no duplicate listeners). */
  usePageTransition()

  usePrefetchAlternateLocales(!isExplorePage)

  const [showWhiteBlocker, setShowWhiteBlocker] = React.useState(false)

  const maskPage =
    !isBootLayoutDone || isNavigating || isPreloaderBVisible

  const showRouteOverlay = maskPage

  /** Portal keeps the overlay out of the route subtree so heavy RSC commits don’t starve its paints */
  const [overlayPortalTarget, setOverlayPortalTarget] = React.useState<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    setOverlayPortalTarget(document.body)
  }, [])

  React.useEffect(() => {
    if (isNavigating || isPreloaderBVisible) {
      setShowWhiteBlocker(true)
    }
  }, [isNavigating, isPreloaderBVisible])

  React.useEffect(() => {
    if (isPreloaderBVisible && showWhiteBlocker) {
      const timeout = setTimeout(() => {
        setShowWhiteBlocker(false)
      }, 50)
      return () => clearTimeout(timeout)
    }

    if (!isNavigating && !isPreloaderBVisible) {
      setShowWhiteBlocker(false)
    }
  }, [isNavigating, isPreloaderBVisible, showWhiteBlocker])

  /** Stuck overlay: repeat visitors / in-app nav only — first visit is controlled by LocaleHomePage. */
  React.useEffect(() => {
    if (!isBootLayoutDone || !hasSeenPreloader) return
    if (!isPreloaderBVisible && !isNavigating) return
    const t = window.setTimeout(() => {
      hidePreloaderB()
      setNavigating(false)
    }, 12000)
    return () => clearTimeout(t)
  }, [
    isBootLayoutDone,
    hasSeenPreloader,
    isPreloaderBVisible,
    isNavigating,
    pathname,
    hidePreloaderB,
    setNavigating,
  ])

  if (isExplorePage) {
    return <>{children}</>
  }

  const routeOverlayEl = showRouteOverlay ? (
    <PreloaderB key="app-route-overlay" bootOnly={!isBootLayoutDone} duration={0.5} shouldAutoHide={false} />
  ) : null

  const routeOverlayNode =
    routeOverlayEl && overlayPortalTarget ? createPortal(routeOverlayEl, overlayPortalTarget) : routeOverlayEl

  return (
    <>
      {showWhiteBlocker && isBootLayoutDone ? (
        <div
          className="fixed inset-0 z-[99997] bg-white transition-opacity duration-200 pointer-events-none"
          style={{
            opacity: showWhiteBlocker ? 1 : 0,
            visibility: showWhiteBlocker ? 'visible' : 'hidden',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/cabonegro_logo.png"
              alt=""
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-80"
              style={{
                filter: 'brightness(0)',
              }}
            />
          </div>
        </div>
      ) : null}

      <div
        style={{
          opacity: maskPage ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
          pointerEvents: maskPage ? 'none' : 'auto',
        }}
      >
        <Suspense fallback={maskPage ? <LoadingFallback /> : null}>
          <DeferredHomeWhileOverlay>{children}</DeferredHomeWhileOverlay>
        </Suspense>
      </div>

      {routeOverlayNode}
    </>
  )
}
