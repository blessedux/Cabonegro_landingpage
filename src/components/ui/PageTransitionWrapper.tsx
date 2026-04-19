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
  // Use the same globe + topo overlay (no logo flash).
  return <PreloaderB key="suspense-fallback-preloader-b" duration={0.5} shouldAutoHide={false} suspended />
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
    <PreloaderB
      key="app-route-overlay"
      bootOnly={!isBootLayoutDone}
      duration={0.5}
      shouldAutoHide={false}
      suspended
    />
  ) : null

  const routeOverlayNode =
    routeOverlayEl && overlayPortalTarget ? createPortal(routeOverlayEl, overlayPortalTarget) : routeOverlayEl

  return (
    <>
      {/*
       * 50 ms flicker guard during route/locale swaps. Used to mount a full
       * PreloaderB here (topo SVG + video), which cost ~15 ms of paint per
       * toggle for no visual benefit — a solid white scrim is indistinguishable
       * to the user for that window. The real animated preloader lives in
       * `routeOverlayNode` below.
       */}
      {showWhiteBlocker && isBootLayoutDone ? (
        <div
          key="white-blocker"
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-white"
          style={{ zIndex: 100002 }}
        />
      ) : null}

      <div
        style={{
          opacity: maskPage ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
          pointerEvents: maskPage ? 'none' : 'auto',
        }}
      >
        {/* Always provide a fallback: when mask lifts, RSC/locale chunks can still suspend — null left an eternal blank */}
        <Suspense fallback={<LoadingFallback />}>
          <DeferredHomeWhileOverlay>{children}</DeferredHomeWhileOverlay>
        </Suspense>
      </div>

      {routeOverlayNode}
    </>
  )
}
