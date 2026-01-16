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
      
      // Mark navigation as active - prevents cleanup from clearing interval prematurely
      isActiveNavigationRef.current = true
      activeNavigationPathRef.current = pathname // Track which pathname this navigation is for
      
      // Reset navigation ref to ensure proper detection
      // This handles cases where preloader was shown explicitly before pathname change
      isNavigatingRef.current = true
      setNavigating(true)

      // CRITICAL: Always show preloader for ALL route changes (including project → home)
      // This ensures smooth transitions and prevents old page from flashing
      // Always call showPreloaderB() even if already visible to ensure state is correct
      // First load is handled by LocaleHomePage separately
      showPreloaderB()

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

        // For regular routes, wait for content to be ready before hiding
        // AGGRESSIVE APPROACH: Hide after 500ms minimum, no complex checks
        let checkCount = 0
        const maxChecks = 30 // 3 seconds max (30 * 100ms) - user wants < 3 seconds
        
        if (process.env.NODE_ENV === 'development') {
          console.log('⏱️ [PERF] Starting content check interval', {
            targetPath: pathname,
            currentPath: window.location.pathname
          })
        }
        
        const checkInterval = setInterval(() => {
          checkCount++
          
          // Minimum wait time for smooth transition (500ms = 5 checks)
          const minWaitTime = checkCount >= 5
          
          // AGGRESSIVE: Just wait 500ms, then hide - no complex checks
          // The pathname has already changed, so navigation has started
          if (minWaitTime || checkCount >= maxChecks) {
            clearInterval(checkInterval)
            checkIntervalRef.current = null
            
            console.log('⏱️ [PERF] Hiding preloader', {
              checkCount,
              timeElapsed: `${(checkCount * 100).toFixed(0)}ms`,
              reason: checkCount >= maxChecks ? 'maxChecks reached' : 'minWaitTime (500ms)',
              isNavigatingRef: isNavigatingRef.current
            })
            
            if (isNavigatingRef.current) {
              console.log('⏱️ [PERF] HIDING PRELOADER NOW', {
                checkCount,
                timeElapsed: `${(checkCount * 100).toFixed(0)}ms`
              })
              // Mark navigation as complete - allows cleanup to run
              isActiveNavigationRef.current = false
              isNavigatingRef.current = false
              hidePreloaderB()
              setNavigating(false)
            } else {
              console.warn('⏱️ [PERF] WARNING: isNavigatingRef is false')
            }
          } else {
            // Log every check to debug
            console.log('⏱️ [PERF] Waiting...', {
              checkCount,
              timeElapsed: `${(checkCount * 100).toFixed(0)}ms`,
              willHideIn: `${((5 - checkCount) * 100).toFixed(0)}ms`,
              isNavigatingRef: isNavigatingRef.current
            })
          }
        }, 100) // Check every 100ms
        checkIntervalRef.current = checkInterval
        console.log('⏱️ [PERF] Interval started', {
          intervalId: checkInterval,
          checkIntervalRef: checkIntervalRef.current !== null
        })
      }

      // Start checking immediately - no delay needed
      // For external apps, wait longer before starting to check
      const minDisplayDelay = isToExploreRoute ? 1500 : 0 // 1.5s for external apps, 0ms for regular routes (start immediately)
      const minDisplayTimer = setTimeout(checkPageLoaded, minDisplayDelay)
      minDisplayTimerRef.current = minDisplayTimer

      // Safety mechanism: Force hide after maximum time
      // CRITICAL: Always reset navigation state to prevent navbar from being blocked
      // User wants < 3 seconds, so set safety to 2s (more aggressive)
      const maxTimeout = isToExploreRoute ? 10000 : 2000 // 10s for external apps, 2s for regular routes (more aggressive)
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
          // Force hide immediately
          hidePreloaderB()
          // CRITICAL: Always reset navigation state, even on safety timer
          setNavigating(false)
        }
      }, maxTimeout)
      safetyTimerRef.current = safetyTimer

      prevPathnameRef.current = pathname

      return () => {
        // CRITICAL: Only cleanup if this is for a DIFFERENT navigation
        // If pathname changed, we're starting a new navigation, so cleanup the old one
        // If pathname is the same, we're re-running due to other dependencies, so preserve timers
        const isNewNavigation = activeNavigationPathRef.current !== pathname
        
        if (isNewNavigation || !isActiveNavigationRef.current) {
          // New navigation started or navigation completed - safe to cleanup old timers
          if (minDisplayTimerRef.current) {
            clearTimeout(minDisplayTimerRef.current)
            minDisplayTimerRef.current = null
          }
          if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current)
            safetyTimerRef.current = null
          }
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
        } else {
          // Same navigation still active - preserve timers/intervals
          // They will be cleaned up when navigation completes or safety timer fires
          console.log('⏱️ [PERF] Cleanup skipped - navigation still active for', activeNavigationPathRef.current)
        }
      }
    }
  }, [pathname, showPreloaderB, hidePreloaderB, setNavigating])

  return { isPreloaderBVisible, hidePreloaderB }
}

