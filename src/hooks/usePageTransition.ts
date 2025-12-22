'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export function usePageTransition() {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string>('')
  const navigationStartRef = useRef<number>(0)
  const isNavigatingRef = useRef<boolean>(false)
  const { showPreloaderB, hidePreloaderB, isPreloaderBVisible, setNavigating } = usePreloader()

  useEffect(() => {
    // Skip on initial mount
    if (!prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      return
    }

    // If pathname changed, always set up hide logic (even if preloader was already shown)
    // This ensures the preloader always gets hidden, regardless of when it was shown
    if (prevPathnameRef.current !== pathname) {
      const navigationStart = Date.now()
      navigationStartRef.current = navigationStart
      
      // Check if navigating from project page to home page
      // Project pages: parque-tecnologico, parque-logistico, terminal-maritimo
      // Home pages: /en, /es, /zh, /fr, / (with or without trailing slash)
      const isFromProjectPage = prevPathnameRef.current.includes('/parque-tecnologico') || 
                                prevPathnameRef.current.includes('/parque-logistico') || 
                                prevPathnameRef.current.includes('/terminal-maritimo')
      // Check if pathname is a home page (exact match or just locale)
      const isToHomePage = pathname === '/' || 
                          pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr' ||
                          pathname.match(/^\/(en|es|zh|fr)\/?$/)
      const isProjectToHome = isFromProjectPage && isToHomePage
      
      // Reset navigation ref to ensure proper detection
      // This handles cases where preloader was shown explicitly before pathname change
      isNavigatingRef.current = true
      setNavigating(true)

      // Skip PreloaderB for project → home navigation (fast transitions)
      // This matches the logic in Navbar.handleHomeClick
      if (isProjectToHome) {
        // Don't show preloader, but still set up hide logic in case it was already shown
        // Reset navigation state immediately for instant navigation
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (isNavigatingRef.current) {
              isNavigatingRef.current = false
              hidePreloaderB()
              setNavigating(false)
            }
          }, 25) // Minimal delay for state updates
        })
        prevPathnameRef.current = pathname
        return
      }

      // Show preloader for other route changes (navigation)
      // If preloader was already shown by a component (like Stats), that's fine
      // Otherwise, show it here to ensure consistent transitions
      // This handles navigation preloaders, first load is handled by LocaleHomePage
      if (!isPreloaderBVisible) {
        showPreloaderB()
      }

      // Check if navigating to /explore route (external app)
      const isToExploreRoute = pathname.includes('/explore')

      // Always set up hide timer when pathname changes
      // This ensures preloader gets hidden even if it was shown explicitly before pathname change
      const checkPageLoaded = () => {
        // For external apps (/explore), wait for page to be fully loaded
        if (isToExploreRoute) {
          // Check if document is ready and external app has loaded
          const checkExternalAppLoaded = () => {
            // Check document ready state
            if (document.readyState === 'complete') {
              // Additional check: wait for any loading indicators to disappear
              // Look for common loading patterns in the DOM
              const hasLoadingElements = document.querySelector('[data-loading], .loading, [class*="loading"]')
              
              if (!hasLoadingElements) {
                // Page appears to be loaded
                if (isNavigatingRef.current) {
                  isNavigatingRef.current = false
                  hidePreloaderB()
                  setNavigating(false)
                }
                return true
              }
            }
            return false
          }

          // Poll for external app to be ready
          const pollInterval = setInterval(() => {
            if (checkExternalAppLoaded()) {
              clearInterval(pollInterval)
            }
          }, 100) // Check every 100ms

          // Safety: clear interval after max time
          setTimeout(() => {
            clearInterval(pollInterval)
            if (isNavigatingRef.current) {
              isNavigatingRef.current = false
              hidePreloaderB()
              setNavigating(false)
            }
          }, 10000) // 10 seconds max for external apps

          return
        }

        // For regular routes, use faster detection
        // Use a single requestAnimationFrame for faster detection
        requestAnimationFrame(() => {
          // Minimal delay to ensure page has started rendering
          setTimeout(() => {
            if (isNavigatingRef.current) {
              isNavigatingRef.current = false
              hidePreloaderB()
              // CRITICAL: Reset navigation state immediately to re-enable navbar clicks
              setNavigating(false)
            }
          }, 25) // Reduced from 50ms to 25ms for faster response
        })
      }

      // Start checking after a minimum display time
      // For external apps, wait longer before starting to check
      const minDisplayDelay = isToExploreRoute ? 1500 : 100 // 1.5s for external apps, 100ms for regular routes
      const minDisplayTimer = setTimeout(checkPageLoaded, minDisplayDelay)

      // Safety mechanism: Force hide after maximum time
      // CRITICAL: Always reset navigation state to prevent navbar from being blocked
      // Longer timeout for external apps
      const maxTimeout = isToExploreRoute ? 10000 : 2000 // 10s for external apps, 2s for regular routes
      const safetyTimer = setTimeout(() => {
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false
          hidePreloaderB()
          // CRITICAL: Always reset navigation state, even on safety timer
          setNavigating(false)
        }
      }, maxTimeout)

      prevPathnameRef.current = pathname

      return () => {
        clearTimeout(minDisplayTimer)
        clearTimeout(safetyTimer)
      }
    }
  }, [pathname, showPreloaderB, hidePreloaderB, isPreloaderBVisible, setNavigating])

  return { isPreloaderBVisible, hidePreloaderB }
}

