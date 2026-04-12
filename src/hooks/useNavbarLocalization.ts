import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { LANGUAGES, NAVBAR_TEXTS, type Locale } from '@/constants/navbarTexts'

/**
 * Hook for navbar localization.
 * Memoizes locale detection and localized text.
 */
export function useNavbarLocalization() {
  const pathname = usePathname()

  // Memoize locale detection
  const currentLocale = useMemo<Locale>(() => {
    if (pathname.startsWith('/es')) return 'es'
    if (pathname.startsWith('/zh')) return 'zh'
    if (pathname.startsWith('/fr')) return 'fr'
    if (pathname.startsWith('/en')) return 'en'
    return 'en'
  }, [pathname])

  // Memoize current language object
  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((lang) => lang.code === currentLocale) || LANGUAGES[0]
  }, [currentLocale])

  // Memoize localized text
  const localizedText = useMemo(() => {
    return NAVBAR_TEXTS[currentLocale] || NAVBAR_TEXTS.en
  }, [currentLocale])

  return {
    currentLocale,
    currentLanguage,
    localizedText,
    languages: LANGUAGES,
  }
}
