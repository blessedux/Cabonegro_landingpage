'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import {
  isLocaleHomePath,
  localeFromPathname,
  normalizePathname,
  stripLocalePrefix,
} from '@/lib/navigation-path'

/** Minimum time navigation preloader stays up after route change so it actually paints */
const MIN_NAV_PRELOADER_MS = 420
const MAX_NAV_PRELOADER_MS = 4500
/** Stop AmCharts + heavy topo animation this long before hide so fade-out isn’t starved */
const DRAIN_HEAVY_BEFORE_HIDE_MS = 180
/** Home route pays a large RSC/JS cost — stop globe/topo earlier so the CSS spinner keeps moving */
const EARLY_HOME_DRAIN_MS = 200

export function usePageTransition() {
  const pathname = usePathname()
  const prevPathnameRef = useRef('')
  const hideNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drainNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const earlyHomeDrainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafChainRef = useRef<number | null>(null)

  const {
    showPreloaderB,
    hidePreloaderB,
    setNavigating,
    setPreloaderDrainHeavy,
    isLanguageSwitch,
    isPreloaderBVisible,
  } = usePreloader()

  /** Must not be in the pathname effect deps — updates there clear hide timers without rescheduling. */
  const isPreloaderBVisibleRef = useRef(isPreloaderBVisible)
  isPreloaderBVisibleRef.current = isPreloaderBVisible

  const isLanguageSwitchRef = useRef(isLanguageSwitch)
  isLanguageSwitchRef.current = isLanguageSwitch

  useEffect(() => {
    if (!prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      return
    }

    if (prevPathnameRef.current === pathname) {
      return
    }

    const prev = prevPathnameRef.current
    prevPathnameRef.current = pathname

    const effectStartedAt = performance.now()

    /** Same logical route, different locale prefix — must not depend on fragile substring math. */
    const routeKeyWithoutLocale = (path: string) => {
      const rest = stripLocalePrefix(normalizePathname(path))
      return rest === '' ? '/' : normalizePathname(rest)
    }

    const prevLocale = localeFromPathname(prev)
    const currentLocale = localeFromPathname(pathname)
    const isLocaleOnly =
      prevLocale !== null &&
      currentLocale !== null &&
      prevLocale !== currentLocale &&
      routeKeyWithoutLocale(prev) === routeKeyWithoutLocale(pathname)

    const clearScheduled = () => {
      setPreloaderDrainHeavy(false)
      if (hideNavTimerRef.current) {
        clearTimeout(hideNavTimerRef.current)
        hideNavTimerRef.current = null
      }
      if (drainNavTimerRef.current) {
        clearTimeout(drainNavTimerRef.current)
        drainNavTimerRef.current = null
      }
      if (earlyHomeDrainTimerRef.current) {
        clearTimeout(earlyHomeDrainTimerRef.current)
        earlyHomeDrainTimerRef.current = null
      }
      if (maxNavTimerRef.current) {
        clearTimeout(maxNavTimerRef.current)
        maxNavTimerRef.current = null
      }
      if (rafChainRef.current != null) {
        cancelAnimationFrame(rafChainRef.current)
        rafChainRef.current = null
      }
    }

    // Locale-only: hide overlay immediately — do NOT setNavigating first (avoids DeferredHomeWhileOverlay + mask churn).
    if (isLanguageSwitchRef.current || isLocaleOnly) {
      clearScheduled()
      hidePreloaderB()
      setNavigating(false)
      return
    }

    setNavigating(true)
    // Click handlers usually already showed the overlay; avoid resetting timers / start time twice.
    if (!isPreloaderBVisibleRef.current) {
      showPreloaderB()
    }

    clearScheduled()

    if (isLocaleHomePath(pathname)) {
      earlyHomeDrainTimerRef.current = setTimeout(() => {
        earlyHomeDrainTimerRef.current = null
        setPreloaderDrainHeavy(true)
      }, EARLY_HOME_DRAIN_MS)
    }

    const runHide = () => {
      hidePreloaderB()
      setNavigating(false)
    }

    const scheduleHide = () => {
      const elapsed = performance.now() - effectStartedAt
      const remaining = Math.max(0, MIN_NAV_PRELOADER_MS - elapsed)

      const startDrain = () => setPreloaderDrainHeavy(true)

      if (remaining > DRAIN_HEAVY_BEFORE_HIDE_MS) {
        drainNavTimerRef.current = setTimeout(() => {
          drainNavTimerRef.current = null
          startDrain()
        }, remaining - DRAIN_HEAVY_BEFORE_HIDE_MS)
      } else {
        startDrain()
      }

      hideNavTimerRef.current = setTimeout(() => {
        hideNavTimerRef.current = null
        requestAnimationFrame(() => {
          requestAnimationFrame(runHide)
        })
      }, remaining)
    }

    rafChainRef.current = requestAnimationFrame(() => {
      rafChainRef.current = null
      scheduleHide()
    })

    maxNavTimerRef.current = setTimeout(() => {
      clearScheduled()
      runHide()
    }, MAX_NAV_PRELOADER_MS)

    return clearScheduled
    // isLanguageSwitch read via isLanguageSwitchRef so pathname updates always use the latest flag without stale closures
  }, [pathname, showPreloaderB, hidePreloaderB, setNavigating, setPreloaderDrainHeavy])

  return { hidePreloaderB }
}
