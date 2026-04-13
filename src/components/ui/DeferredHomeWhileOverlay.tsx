'use client'

import { useLayoutEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { isLocaleHomePath } from '@/lib/navigation-path'

/**
 * While navigating back to the locale home with the route preloader up, do **not** mount
 * `LocaleHomePage` (heavy dynamic sections + AmCharts contention). That work used to block
 * the main thread and freeze CSS/canvas on the overlay. First visit to home still mounts
 * immediately so existing first-load preloader logic in LocaleHomePage runs.
 */
export function DeferredHomeWhileOverlay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isBootLayoutDone, isNavigating, isPreloaderBVisible, hasSeenPreloader } = usePreloader()
  const maskPage = !isBootLayoutDone || isNavigating || isPreloaderBVisible

  const [layoutReady, setLayoutReady] = useState(false)
  useLayoutEffect(() => {
    setLayoutReady(true)
  }, [])

  const returnVisit =
    typeof window !== 'undefined' &&
    Boolean(localStorage.getItem('cabonegro-homepage-visited'))

  /** Not the first-ever home session (LocaleHomePage must mount for first-visit preloader). */
  const notFirstHomeSession = returnVisit || hasSeenPreloader

  const deferHomeMount =
    layoutReady && notFirstHomeSession && isLocaleHomePath(pathname) && maskPage

  if (deferHomeMount) {
    return <div className="min-h-[100dvh] w-full bg-white" aria-hidden />
  }

  return <>{children}</>
}
