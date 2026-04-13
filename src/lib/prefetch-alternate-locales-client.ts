'use client'

import { routing } from '@/i18n/routing'
import {
  buildLocaleHref,
  isLocaleHomePath,
  localeFromPathname,
} from '@/lib/navigation-path'
import { prefetchHomeChunksForLocale } from '@/lib/prefetch-locale-home-chunks'

/** Minimal router surface — App Router instance from `useRouter()`. */
export type PrefetchRouter = { prefetch: (href: string) => void | Promise<void> }

/** Save-Data / slow connection: still prefetch RSC routes, skip heavy dynamic-import warming. */
export function shouldSkipHeavyLocaleChunkWarm(): boolean {
  if (typeof navigator === 'undefined') return false
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection
  if (c?.saveData) return true
  if (c?.effectiveType === 'slow-2g' || c?.effectiveType === '2g') return true
  return false
}

/**
 * Prefetch all alternate locale URLs for the current path (Next.js flight/RSC data).
 * Cheap relative to chunk warming — safe to call often (route open, rAF, pathname change).
 */
export function prefetchAlternateLocaleRscRoutes(
  pathname: string,
  router: PrefetchRouter
): void {
  const current = localeFromPathname(pathname) ?? routing.defaultLocale
  for (const loc of routing.locales) {
    if (loc === current) continue
    const href = buildLocaleHref(loc, pathname)
    try {
      void router.prefetch(href)
    } catch {
      /* ignore */
    }
  }
}

/**
 * Dynamic-import locale chunks (Hero, Navbar, maps, …) — run when idle or when user opens language UI.
 * Skipped on Save-Data / 2G unless `force` (user explicitly opened language UI).
 */
export function warmLocaleSpecificChunks(
  pathname: string,
  router: PrefetchRouter,
  options?: { force?: boolean }
): void {
  if (!options?.force && shouldSkipHeavyLocaleChunkWarm()) return

  const current = localeFromPathname(pathname) ?? routing.defaultLocale

  if (isLocaleHomePath(pathname)) {
    for (const loc of routing.locales) {
      if (loc === current) continue
      void Promise.all(prefetchHomeChunksForLocale(loc)).catch(() => {})
    }
  } else {
    const homeHref = `/${current}`
    try {
      void router.prefetch(homeHref)
    } catch {
      /* ignore */
    }
    void Promise.all(prefetchHomeChunksForLocale(current)).catch(() => {})
  }
}

/** RSC prefetch + heavy chunk warm. Use `forceHeavy` when the user opened the language menu (intent to switch). */
export function warmAlternateLocalesForPath(
  pathname: string,
  router: PrefetchRouter,
  options?: { forceHeavy?: boolean }
): void {
  prefetchAlternateLocaleRscRoutes(pathname, router)
  warmLocaleSpecificChunks(pathname, router, { force: options?.forceHeavy })
}
