'use client'

import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { normalizePathname, pathsMatch } from '@/lib/navigation-path'

export type NavigateWithPreloaderOptions = {
  /** Locale switch: always show overlay and set language flag; never treat as same-route. */
  languageSwitch?: boolean
}

/**
 * Programmatic navigation with transition overlay. Skips overlay + avoids `router.push`
 * when the target pathname matches the current route (Next.js does not fire pathname updates for same-route pushes).
 */
export function useNavigateWithPreloader() {
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB, hidePreloaderB, setLanguageSwitch } = usePreloader()

  const push = useCallback(
    (href: string, options?: NavigateWithPreloaderOptions) => {
      if (options?.languageSwitch) {
        flushSync(() => {
          setLanguageSwitch(true)
          showPreloaderB()
        })
        router.push(href)
        return
      }

      if (pathsMatch(pathname, href)) {
        hidePreloaderB()
        if (typeof window !== 'undefined') {
          try {
            const next = new URL(href, window.location.origin)
            const cur = new URL(window.location.href)
            const pathSame =
              normalizePathname(next.pathname) === normalizePathname(cur.pathname)
            const needsClientNav =
              pathSame && (next.hash !== cur.hash || next.search !== cur.search)
            if (needsClientNav) {
              router.push(href)
            }
          } catch {
            /* ignore */
          }
        }
        return
      }

      flushSync(() => {
        showPreloaderB()
      })
      router.push(href)
    },
    [pathname, router, showPreloaderB, hidePreloaderB, setLanguageSwitch]
  )

  return { push }
}
