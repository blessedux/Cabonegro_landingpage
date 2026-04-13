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
  const {
    isBootLayoutDone,
    isNavigating,
    isPreloaderBVisible,
    hasSeenPreloader,
    isLanguageSwitch,
  } = usePreloader()
  const maskPage = !isBootLayoutDone || isNavigating || isPreloaderBVisible

  const [layoutReady, setLayoutReady] = useState(false)
  useLayoutEffect(() => {
    setLayoutReady(true)
  }, [])

  /** True only after first-load preloader finished (LocaleHomePage sets key then) — never on first paint. */
  const returnVisit =
    typeof window !== 'undefined' &&
    Boolean(localStorage.getItem('cabonegro-homepage-visited'))

  /** Not the first-ever home session (LocaleHomePage must mount for first-visit preloader). */
  const notFirstHomeSession = returnVisit || hasSeenPreloader

  /**
   * Never swap the home tree for a white shell during locale changes — that unmount caused a blank
   * screen after PreloaderB hid (new locale segment + remount race). In-app nav to home still defers.
   */
  const deferHomeMount =
    layoutReady &&
    notFirstHomeSession &&
    isLocaleHomePath(pathname) &&
    maskPage &&
    !isLanguageSwitch

  if (deferHomeMount) {
    return <div className="min-h-[100dvh] w-full bg-white" aria-hidden />
  }

  return <>{children}</>
}
