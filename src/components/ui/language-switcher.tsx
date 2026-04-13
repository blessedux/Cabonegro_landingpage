'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import { warmAlternateLocalesForPath } from '@/lib/prefetch-alternate-locales-client'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇨🇱' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const { push } = useNavigateWithPreloader()

  const warmLanguageSwitchIntent = useCallback(() => {
    warmAlternateLocalesForPath(pathname, router, { forceHeavy: true })
  }, [pathname, router])

  // Get current language using next-intl's useLocale hook
  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  useEffect(() => {
    if (!isOpen) return
    warmLanguageSwitchIntent()
  }, [isOpen, warmLanguageSwitchIntent])

  // Prefetch language route on hover for instant switching
  const prefetchLanguageRoute = (newLocale: string) => {
    if (newLocale === locale) return
    
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}`)) {
        pathWithoutLocale = pathname.substring(loc.length + 1) || ''
        break
      }
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Build target path
    const targetPath = `/${newLocale}${pathWithoutLocale || ''}`
    
    // Prefetch the route for instant navigation
    router.prefetch(targetPath)
  }

  const handleLanguageChange = (newLocale: string) => {
    // Validate locale
    if (!routing.locales.includes(newLocale as any) || newLocale === locale) {
      return
    }
    
    // Close dropdown immediately for instant UI feedback
    setIsOpen(false)
    
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}`)) {
        pathWithoutLocale = pathname.substring(loc.length + 1) || ''
        break
      }
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Build target path
    const targetPath = `/${newLocale}${pathWithoutLocale || ''}`

    router.prefetch(targetPath)

    // Same path as UnifiedNavbar: sync overlay + language flag, then navigate (avoids stuck transition).
    push(targetPath, { languageSwitch: true })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onPointerEnter={warmLanguageSwitchIntent}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 hover:bg-gray-800/80 transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              onMouseEnter={() => prefetchLanguageRoute(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                language.code === locale
                  ? 'text-cyan-400 bg-gray-800/50'
                  : 'text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === locale && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
