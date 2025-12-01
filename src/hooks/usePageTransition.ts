'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export function usePageTransition() {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string>('')
  const { showPreloaderB, hidePreloaderB, isPreloaderBVisible } = usePreloader()

  useEffect(() => {
    // Skip on initial mount
    if (!prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      return
    }

    // If pathname changed
    if (prevPathnameRef.current !== pathname) {
      // Optimized helper functions - use simple string checks instead of split operations
      const isHomePage = (path: string) => {
        return path === '/' || 
               path === '/en' || 
               path === '/es' || 
               path === '/zh' ||
               path === '/fr' ||
               path.match(/^\/(en|es|zh|fr)\/?$/)
      }

      const isSpecialPage = (path: string) => {
        return path.includes('/explore') || 
               path.includes('/deck') || 
               path.includes('/contact')
      }

      const isProjectPage = (path: string) => {
        return path.includes('/parque-tecnologico') || 
               path.includes('/parque-logistico') || 
               path.includes('/terminal-maritimo')
      }

      const prevPath = prevPathnameRef.current
      const currentPath = pathname

      const wasOnHome = isHomePage(prevPath)
      const isOnHome = isHomePage(currentPath)
      const wasOnSpecial = isSpecialPage(prevPath)
      const isOnSpecial = isSpecialPage(currentPath)
      const wasOnProject = isProjectPage(prevPath)
      const isOnProject = isProjectPage(currentPath)

      // Fast path: if both are home or both are project pages, skip PreloaderB
      if (wasOnHome && isOnHome && prevPath !== currentPath) {
        // Language switch on home - no preloader needed
        prevPathnameRef.current = pathname
        return
      }

      // Fast path: navigation between project pages - no PreloaderB needed (they're already fast)
      if (wasOnProject && isOnProject) {
        prevPathnameRef.current = pathname
        return
      }

      // Fast path: navigation between home and project pages - no PreloaderB needed
      if ((wasOnHome && isOnProject) || (wasOnProject && isOnHome)) {
        prevPathnameRef.current = pathname
        return
      }

      // Extract page type only when needed (lazy evaluation)
      const prevPageType = wasOnSpecial ? prevPath.split('/')[2] : null
      const currentPageType = isOnSpecial ? currentPath.split('/')[2] : null
      const prevLocale = prevPath.split('/')[1]
      const currentLocale = currentPath.split('/')[1]
      
      const isLanguageSwitchOnSpecial = wasOnSpecial && isOnSpecial && 
                                        prevPath !== currentPath &&
                                        prevLocale !== currentLocale &&
                                        prevPageType === currentPageType

      // Show PreloaderB if:
      // 1. Navigating from home to special page OR from special page to home
      // 2. Navigating between different special pages (e.g., explore to deck)
      // 3. Switching languages on special pages (e.g., /es/explore to /en/explore)
      // Note: Project pages don't trigger PreloaderB (already handled above)
      const shouldShowPreloaderB = 
        (!wasOnHome || !isOnHome) && ((wasOnHome && isOnSpecial) || (wasOnSpecial && isOnHome)) || // Home <-> Special page navigation
        (wasOnSpecial && isOnSpecial && !isLanguageSwitchOnSpecial && prevPageType !== currentPageType) || // Different special pages
        isLanguageSwitchOnSpecial // Language switch on same special page

      if (shouldShowPreloaderB) {
        showPreloaderB()
      }

      prevPathnameRef.current = pathname
    }
  }, [pathname, showPreloaderB])

  return { isPreloaderBVisible, hidePreloaderB }
}

