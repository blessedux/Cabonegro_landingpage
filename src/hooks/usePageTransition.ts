'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export function usePageTransition() {
  const pathname = usePathname()
  const prevPathnameRef = useRef<string>('')
  const navigationStartRef = useRef<number>(0)
  const isNavigatingRef = useRef<boolean>(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveNavigationRef = useRef<boolean>(false) // Track if navigation is actively in progress
  const activeNavigationPathRef = useRef<string>('') // Track which pathname this navigation is for
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { showPreloaderB, hidePreloaderB, isPreloaderBVisible, setNavigating, isLanguageSwitch } = usePreloader()

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
      
      // Mark navigation as active - prevents cleanup from clearing interval prematurely
      isActiveNavigationRef.current = true
      activeNavigationPathRef.current = pathname // Track which pathname this navigation is for
      
      // CRITICAL: Set navigating state IMMEDIATELY to ensure white blocker shows
      // This must happen before any other logic
      isNavigatingRef.current = true
      setNavigating(true)

      // CRITICAL: ALWAYS show preloader on pathname change
      // Don't check if already visible - ensure it's visible for ALL navigation scenarios
      // This prevents blank white screens during navigation
      // Even if navbar already showed it, showing again ensures it's visible
      showPreloaderB()

      // CRITICAL FIX: For language switches, hide preloader IMMEDIATELY
      // Don't wait for any timers or checks - language switches should be instant
      // Also detect language switches by checking if pathname changed locale prefix
      const prevLocale = prevPathnameRef.current.split('/')[1] || ''
      const currentLocale = pathname.split('/')[1] || ''
      const isLocaleChange = prevLocale !== currentLocale && 
                            ['en', 'es', 'zh', 'fr'].includes(prevLocale) && 
                            ['en', 'es', 'zh', 'fr'].includes(currentLocale) &&
                            prevPathnameRef.current.substring(prevLocale.length + 2) === pathname.substring(currentLocale.length + 2) // Same path, different locale
      
      if (isLanguageSwitch || isLocaleChange) {
        // Hide immediately - no delays, no checks, no timers
        isActiveNavigationRef.current = false
        isNavigatingRef.current = false
        
        // Clean up any timers that might have been set
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
          checkIntervalRef.current = null
        }
        if (safetyTimerRef.current) {
          clearTimeout(safetyTimerRef.current)
          safetyTimerRef.current = null
        }
        if (minDisplayTimerRef.current) {
          clearTimeout(minDisplayTimerRef.current)
          minDisplayTimerRef.current = null
        }
        
        // Hide preloader immediately - no delays whatsoever
        if (process.env.NODE_ENV === 'development') {
          console.log('🌐 [PERF] Language switch detected - hiding preloader immediately', {
            isLanguageSwitch,
            isLocaleChange,
            from: prevPathnameRef.current,
            to: pathname
          })
        }
        
        // CRITICAL: Hide immediately - no requestAnimationFrame, no delays
        // Language switches must be instant
        hidePreloaderB()
        setNavigating(false)
        
        // Update pathname and return early - skip all other logic
        prevPathnameRef.current = pathname
        return
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
                  isActiveNavigationRef.current = false
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
              isActiveNavigationRef.current = false
              isNavigatingRef.current = false
              hidePreloaderB()
              setNavigating(false)
            }
          }, 10000) // 10 seconds max for external apps

          return
        }

        // For regular routes, hide preloader immediately when pathname changes
        // CRITICAL FIX: Hide immediately - don't wait for RAF
        // For language switches, we want instant hiding
        const hidePreloader = () => {
          if (isNavigatingRef.current) {
            if (process.env.NODE_ENV === 'development') {
              console.log('⏱️ [PERF] Hiding preloader immediately', {
                pathname,
                timeSinceNav: Date.now() - navigationStart
              })
            }
            // Mark navigation as complete - allows cleanup to run
            isActiveNavigationRef.current = false
            isNavigatingRef.current = false
            
            // Clean up timers to prevent them from firing after preloader is hidden
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
            if (safetyTimerRef.current) {
              clearTimeout(safetyTimerRef.current)
              safetyTimerRef.current = null
            }
            
            hidePreloaderB()
            setNavigating(false)
          }
        }

        // CRITICAL FIX: Hide immediately - don't wait for RAF
        // For language switches, we want instant hiding
        hidePreloader()
        
        // OPTIMIZED: Simplified safety fallback - only if hidePreloader didn't work
        // Reduced checks and shorter timeout for faster transitions
        let checkCount = 0
        const maxChecks = 2 // 100ms max (2 * 50ms) - very fast timeout
        
        const checkInterval = setInterval(() => {
          checkCount++
          
          // Safety check: Hide if max checks reached (fallback only)
          if (checkCount >= maxChecks) {
            clearInterval(checkInterval)
            checkIntervalRef.current = null
            
            if (isNavigatingRef.current) {
              if (process.env.NODE_ENV === 'development') {
                console.log('⏱️ [PERF] Safety interval - hiding preloader', {
                  checkCount,
                  timeElapsed: `${(checkCount * 50).toFixed(0)}ms`
                })
              }
              isActiveNavigationRef.current = false
              isNavigatingRef.current = false
              
              // Clean up other timers
              if (safetyTimerRef.current) {
                clearTimeout(safetyTimerRef.current)
                safetyTimerRef.current = null
              }
              
              hidePreloaderB()
              setNavigating(false)
            }
          }
        }, 50) // Check every 50ms
        checkIntervalRef.current = checkInterval
      }

      // Start checking immediately - no delay needed
      // For external apps, wait longer before starting to check
      const minDisplayDelay = isToExploreRoute ? 1500 : 0 // 1.5s for external apps, 0ms for regular routes (start immediately)
      const minDisplayTimer = setTimeout(checkPageLoaded, minDisplayDelay)
      minDisplayTimerRef.current = minDisplayTimer

      // CRITICAL FIX: Aggressive safety timer to prevent getting stuck
      // Force hide after maximum time - this is the last resort
      // Reduced to 200ms for very fast language switching
      const maxTimeout = isToExploreRoute ? 10000 : 200 // 10s for external apps, 200ms for regular routes (very aggressive)
      const safetyTimer = setTimeout(() => {
        if (isNavigatingRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] Safety timer (2s) - FORCING navigation complete', {
              checkIntervalRunning: checkIntervalRef.current !== null
            })
          }
          // Clear interval if still running
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ [PERF] SAFETY TIMER - FORCING HIDE', {
              checkIntervalRunning: checkIntervalRef.current !== null
            })
          }
          // Mark navigation as complete - allows cleanup to run
          isActiveNavigationRef.current = false
          isNavigatingRef.current = false
          // Force hide immediately - this is the last resort safety mechanism
          hidePreloaderB()
          // CRITICAL: Always reset navigation state, even on safety timer
          setNavigating(false)
        }
      }, maxTimeout)
      safetyTimerRef.current = safetyTimer

      // CRITICAL: Update prevPathname AFTER setting up all timers
      // This ensures cleanup can detect if pathname changed
      const currentPathname = pathname
      prevPathnameRef.current = currentPathname

      return () => {
        // CRITICAL FIX: Only cleanup minDisplayTimer
        // Safety timer and checkInterval MUST run to ensure preloader hides
        // They will be cleaned up when hidePreloader() is called or when they fire
        if (minDisplayTimerRef.current) {
          clearTimeout(minDisplayTimerRef.current)
          minDisplayTimerRef.current = null
        }
        // NEVER clear safetyTimer or checkInterval in cleanup
        // They are the safety mechanism to ensure preloader always hides
      }
    }
  }, [pathname, showPreloaderB, hidePreloaderB, setNavigating, isLanguageSwitch])

  return { isPreloaderBVisible, hidePreloaderB }
}

