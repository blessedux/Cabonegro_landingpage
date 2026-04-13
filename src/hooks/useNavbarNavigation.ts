import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import { buildLocaleHref } from '@/lib/navigation-path'
import type { Locale } from '@/constants/navbarTexts'

/**
 * Hook for navbar navigation handlers.
 * Memoizes all navigation callbacks for performance.
 */
export function useNavbarNavigation(currentLocale: Locale) {
  const router = useRouter()
  const pathname = usePathname()
  const { push } = useNavigateWithPreloader()

  // Get home path for current locale
  const getHomePath = useCallback((): string => {
    switch (currentLocale) {
      case 'es':
        return '/es'
      case 'zh':
        return '/zh'
      case 'fr':
        return '/fr'
      default:
        return '/en'
    }
  }, [currentLocale])

  // Handle project navigation - instant navigation
  const handleProjectNavigation = useCallback(
    (route: string) => {
      push(`/${currentLocale}${route}`)
    },
    [currentLocale, push]
  )

  // Prefetch language route on hover for instant navigation
  // Keep prefetch lightweight to avoid background bandwidth spikes.
  const prefetchLanguageRoute = useCallback(
    (newLocale: string) => {
      router.prefetch(buildLocaleHref(newLocale, pathname))
    },
    [pathname, router]
  )

  // Handle language change - optimized for instant response
  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      const targetPath = buildLocaleHref(newLocale, pathname)

      router.prefetch(targetPath)

      push(targetPath, { languageSwitch: true })
    },
    [pathname, router, push]
  )

  // Handle Home navigation (logo click)
  const handleHomeClick = useCallback(
    (e: React.MouseEvent) => {
      const isOnHomePage =
        pathname === '/en' ||
        pathname === '/' ||
        pathname === '/es' ||
        pathname === '/zh' ||
        pathname === '/fr'

      if (isOnHomePage) {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      e.preventDefault()

      const homePath = getHomePath()
      push(homePath)
    },
    [pathname, push, getHomePath]
  )

  // Handle FAQ click
  const handleFAQClick = useCallback(
    (e: React.MouseEvent) => {
      const isOnSpecialPage =
        pathname.includes('/explore') ||
        pathname.includes('/deck') ||
        pathname.includes('/contact')

      const isOnHomePage =
        pathname === '/en' ||
        pathname === '/' ||
        pathname === '/es' ||
        pathname === '/zh' ||
        pathname === '/fr'

      if (!isOnSpecialPage && isOnHomePage) {
        e.preventDefault()
        const faqElement = document.getElementById('FAQ')
        if (faqElement) {
          const elementPosition = faqElement.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - 20
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
        }
        return
      }

      e.preventDefault()

      const homePath = getHomePath()
      push(`${homePath}#FAQ`)
    },
    [pathname, push, getHomePath]
  )

  // Handle contact navigation
  const handleContactClick = useCallback(() => {
    const contactPath = `${getHomePath()}/contact`
    push(contactPath)
  }, [push, getHomePath])

  return {
    handleProjectNavigation,
    handleHomeClick,
    handleFAQClick,
    handleLanguageChange,
    handleContactClick,
    prefetchLanguageRoute,
    getHomePath,
  }
}
