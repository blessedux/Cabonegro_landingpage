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

      // Show PreloaderB if:
      // 1. Navigating from home to any page OR from any page to home
      // 2. Navigating between special pages
      // 3. Switching languages on special pages (explore/deck/contact)
      const shouldShowPreloaderB = 
        (!isLanguageSwitchOnHome && (wasOnHome || isOnHome)) || // Home navigation
        (wasOnSpecial || isOnSpecial) || // Special page navigation
        (wasOnSpecial && !wasOnHome && !isOnHome && prevPath.split('/')[1] !== currentPath.split('/')[1]) // Language switch on special pages

      if (shouldShowPreloaderB) {
        showPreloaderB()
      }

      prevPathnameRef.current = pathname
    }
  }, [pathname, showPreloaderB])

  return { isPreloaderBVisible, hidePreloaderB }
}

