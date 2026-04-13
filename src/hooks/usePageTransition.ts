'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { isLocaleHomePath } from '@/lib/navigation-path'

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

    setNavigating(true)
    // Click handlers usually already showed the overlay; avoid resetting timers / start time twice.
    if (!isPreloaderBVisibleRef.current) {
      showPreloaderB()
    }

    const prevLocale = prev.split('/')[1] || ''
    const currentLocale = pathname.split('/')[1] || ''
    const isLocaleChange =
      prevLocale !== currentLocale &&
      ['en', 'es', 'zh', 'fr'].includes(prevLocale) &&
      ['en', 'es', 'zh', 'fr'].includes(currentLocale) &&
      prev.substring(prevLocale.length + 2) === pathname.substring(currentLocale.length + 2)

    if (isLanguageSwitch || isLocaleChange) {
      if (hideNavTimerRef.current) clearTimeout(hideNavTimerRef.current)
      if (maxNavTimerRef.current) clearTimeout(maxNavTimerRef.current)
      hideNavTimerRef.current = null
      maxNavTimerRef.current = null
      hidePreloaderB()
      setNavigating(false)
      return
    }

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
  }, [pathname, showPreloaderB, hidePreloaderB, setNavigating, setPreloaderDrainHeavy, isLanguageSwitch])

  return { hidePreloaderB }
}
