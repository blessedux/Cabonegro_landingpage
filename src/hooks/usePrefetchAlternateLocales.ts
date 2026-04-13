'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { routing } from '@/i18n/routing'
import {
  buildLocaleHref,
  isLocaleHomePath,
  localeFromPathname,
} from '@/lib/navigation-path'
import { prefetchHomeChunksForLocale } from '@/lib/prefetch-locale-home-chunks'

/**
 * After idle time, prefetches alternate locale URLs for the current path and (on home)
 * warms locale-specific dynamic chunks so language switches avoid multi-second JS waterfalls.
 */
export function usePrefetchAlternateLocales(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const ranKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const current = localeFromPathname(pathname) ?? routing.defaultLocale
    const key = `${pathname}::${current}`
    if (ranKeyRef.current === key) return

    const useIdleCallback = typeof window.requestIdleCallback === 'function'
    const idleId = useIdleCallback
      ? window.requestIdleCallback(() => runPrefetch(), { timeout: 2800 })
      : window.setTimeout(() => runPrefetch(), 900)

    function runPrefetch() {
      if (ranKeyRef.current === key) return
      ranKeyRef.current = key

      for (const loc of routing.locales) {
        if (loc === current) continue
        const href = buildLocaleHref(loc, pathname)
        try {
          router.prefetch(href)
        } catch {
          /* ignore */
        }
      }

      if (isLocaleHomePath(pathname)) {
        for (const loc of routing.locales) {
          if (loc === current) continue
          void Promise.all(prefetchHomeChunksForLocale(loc)).catch(() => {})
        }
      } else {
        const homeHref = `/${current}`
        try {
          router.prefetch(homeHref)
        } catch {
          /* ignore */
        }
        // Warm the current locale’s home chunks so Contact → Home avoids a multi-second JS waterfall
        void Promise.all(prefetchHomeChunksForLocale(current)).catch(() => {})
      }
    }

    return () => {
      if (useIdleCallback) {
        window.cancelIdleCallback(idleId)
      } else {
        clearTimeout(idleId)
      }
    }
  }, [enabled, pathname, router])
}
