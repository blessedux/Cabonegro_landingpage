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
      // Helper to check if path is home page
      const isHomePage = (path: string) => {
        return path === '/' || 
               path === '/en' || 
               path === '/es' || 
               path === '/zh' ||
               (path.startsWith('/en/') && path.split('/').length === 2) ||
               (path.startsWith('/es/') && path.split('/').length === 2) ||
               (path.startsWith('/zh/') && path.split('/').length === 2)
      }

      // Helper to check if path is a special page (explore, deck, contact)
      const isSpecialPage = (path: string) => {
        return path.includes('/explore') || 
               path.includes('/deck') || 
               path.includes('/contact')
      }

      const prevPath = prevPathnameRef.current
      const currentPath = pathname

      const wasOnHome = isHomePage(prevPath)
      const isOnHome = isHomePage(currentPath)
      const wasOnSpecial = isSpecialPage(prevPath)
      const isOnSpecial = isSpecialPage(currentPath)

      // Check if this is a language switch on home (don't show PreloaderB)
      const isLanguageSwitchOnHome = wasOnHome && isOnHome && prevPath !== currentPath
      
      // Check if this is a language switch on special pages (both paths are special pages but different locales)
      // Extract page type (explore/deck/contact) from paths
      const prevPageType = prevPath.split('/')[2] // e.g., 'explore' from '/es/explore'
      const currentPageType = currentPath.split('/')[2] // e.g., 'explore' from '/en/explore'
      const prevLocale = prevPath.split('/')[1] // e.g., 'es'
      const currentLocale = currentPath.split('/')[1] // e.g., 'en'
      
      const isLanguageSwitchOnSpecial = wasOnSpecial && isOnSpecial && 
                                        prevPath !== currentPath &&
                                        prevLocale !== currentLocale &&
                                        prevPageType === currentPageType // Same page type (explore/deck/contact)

      // Show PreloaderB if:
      // 1. Navigating from home to any page OR from any page to home
      // 2. Navigating between different special pages (e.g., explore to deck)
      // 3. Switching languages on special pages (e.g., /es/explore to /en/explore)
      const shouldShowPreloaderB = 
        (!isLanguageSwitchOnHome && (wasOnHome || isOnHome)) || // Home navigation
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

