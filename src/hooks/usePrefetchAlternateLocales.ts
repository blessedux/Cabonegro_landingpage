'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  prefetchAlternateLocaleRscRoutes,
  warmLocaleSpecificChunks,
} from '@/lib/prefetch-alternate-locales-client'

/**
 * 1) Next frame: prefetch alternate locale **RSC/flight** routes (small, fast).
 * 2) When idle: warm heavy locale **JS chunks** (Hero, maps, …) — skipped on Save-Data / 2G.
 * Keeps `/locale/...` URLs unchanged (SEO-safe).
 */
export function usePrefetchAlternateLocales(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const chunksWarmedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const key = pathname

    const raf = requestAnimationFrame(() => {
      prefetchAlternateLocaleRscRoutes(pathname, router)
    })

    const runHeavy = () => {
      if (chunksWarmedKeyRef.current === key) return
      chunksWarmedKeyRef.current = key
      warmLocaleSpecificChunks(pathname, router)
    }

    const useIdleCallback = typeof window.requestIdleCallback === 'function'
    const idleHandle = useIdleCallback
      ? window.requestIdleCallback(() => runHeavy(), { timeout: 700 })
      : window.setTimeout(() => runHeavy(), 400)

    return () => {
      cancelAnimationFrame(raf)
      if (useIdleCallback) {
        window.cancelIdleCallback(idleHandle)
      } else {
        clearTimeout(idleHandle)
      }
    }
  }, [enabled, pathname, router])
}
