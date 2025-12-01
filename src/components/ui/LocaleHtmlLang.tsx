'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function LocaleHtmlLang() {
  const pathname = usePathname()

  useEffect(() => {
    // Extract locale from pathname
    let locale = routing.defaultLocale
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}`)) {
        locale = loc
        break
      }
    }

    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [pathname])

  return null
}

