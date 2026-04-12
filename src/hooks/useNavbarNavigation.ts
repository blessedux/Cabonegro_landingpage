import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import type { Locale } from '@/constants/navbarTexts'

/**
 * Hook for navbar navigation handlers.
 * Memoizes all navigation callbacks for performance.
 */
export function useNavbarNavigation(currentLocale: Locale) {
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB, setLanguageSwitch } = usePreloader()

  // Extract locale path logic to a helper function
  const getPathWithoutLocale = useCallback((path: string): string => {
    let pathWithoutLocale = path
    if (path.startsWith('/es')) {
      pathWithoutLocale = path.substring(3)
    } else if (path.startsWith('/zh')) {
      pathWithoutLocale = path.substring(3)
    } else if (path.startsWith('/fr')) {
      pathWithoutLocale = path.substring(3)
    } else if (path.startsWith('/en')) {
      pathWithoutLocale = path.substring(3)
    }

    // Ensure path starts with '/'
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }

    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }

    return pathWithoutLocale
  }, [])

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
      flushSync(() => {
        showPreloaderB()
      })
      router.push(`/${currentLocale}${route}`)
    },
    [currentLocale, router, showPreloaderB]
  )

  // Prefetch language route on hover for instant navigation
  // OPTIMIZED: Also preload locale-specific components for instant switching
  const prefetchLanguageRoute = useCallback(
    (newLocale: string) => {
      const pathWithoutLocale = getPathWithoutLocale(pathname)
      const targetPath = `/${newLocale}${pathWithoutLocale}`
      
      // Prefetch the route
      router.prefetch(targetPath)
      
      // OPTIMIZED: Preload locale-specific components in background
      // This ensures components are ready before user clicks
      const componentPreloadPromises = [
        // Preload locale-specific components
        newLocale === 'es' ? import('@/components/sections/Partners-es') : 
        newLocale === 'zh' ? import('@/components/sections/Partners') : 
        newLocale === 'fr' ? import('@/components/sections/Partners') : 
        import('@/components/sections/Partners'),
        newLocale === 'es' ? import('@/components/sections/Hero-es') : 
        newLocale === 'zh' ? import('@/components/sections/Hero-zh') :
        newLocale === 'fr' ? import('@/components/sections/Hero-fr') : 
        import('@/components/sections/Hero'),
        newLocale === 'es' ? import('@/components/sections/Navbar-es') :
        newLocale === 'zh' ? import('@/components/sections/Navbar-zh') : 
        import('@/components/sections/Navbar'),
        newLocale === 'es' ? import('@/components/sections/FAQ-es') :
        newLocale === 'zh' ? import('@/components/sections/FAQ-zh') : 
        import('@/components/sections/FAQ'),
        newLocale === 'es' ? import('@/components/ui/world-map-demo-es').then(mod => ({ default: mod.WorldMapDemoEs })) :
        newLocale === 'zh' ? import('@/components/ui/world-map-demo-zh').then(mod => ({ default: mod.WorldMapDemoZh })) :
        newLocale === 'fr' ? import('@/components/ui/world-map-demo-fr').then(mod => ({ default: mod.WorldMapDemoFr })) :
        import('@/components/ui/world-map-demo').then(mod => ({ default: mod.WorldMapDemo })),
      ]
      
      // Preload in background (non-blocking)
      Promise.all(componentPreloadPromises).catch(() => {
        // Silently fail - components will load on-demand if preload fails
      })
    },
    [pathname, router, getPathWithoutLocale]
  )

  // Handle language change - optimized for instant response
  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      const pathWithoutLocale = getPathWithoutLocale(pathname)
      const targetPath = `/${newLocale}${pathWithoutLocale}`

      // OPTIMIZED: Prefetch first (non-blocking) for faster loading
      router.prefetch(targetPath)

      // OPTIMIZED: Batch all state updates in single flushSync for instant UI feedback
      flushSync(() => {
        setLanguageSwitch(true)
        showPreloaderB()
      })

      // Navigate immediately - no delays
      router.push(targetPath)
    },
    [pathname, router, showPreloaderB, setLanguageSwitch, getPathWithoutLocale]
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

      flushSync(() => {
        showPreloaderB()
      })

      const homePath = getHomePath()
      router.push(homePath)
    },
    [pathname, router, showPreloaderB, getHomePath]
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

      flushSync(() => {
        showPreloaderB()
      })

      const homePath = getHomePath()
      router.push(`${homePath}#FAQ`)
    },
    [pathname, router, showPreloaderB, getHomePath]
  )

  // Handle contact navigation
  const handleContactClick = useCallback(() => {
    const contactPath = `${getHomePath()}/contact`
    flushSync(() => {
      showPreloaderB()
    })
    router.push(contactPath)
  }, [router, showPreloaderB, getHomePath])

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
