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

    // If pathname changed and we're not already navigating
    if (prevPathnameRef.current !== pathname && !isNavigatingRef.current) {
      const navigationStart = Date.now()
      navigationStartRef.current = navigationStart
      isNavigatingRef.current = true
      
      setNavigating(true)

      // Show preloader for ALL route changes (navigation)
      // If preloader was already shown by a component (like Stats), that's fine
      // Otherwise, show it here to ensure consistent transitions
      // This handles navigation preloaders, first load is handled by LocaleHomePage
      if (!isPreloaderBVisible) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 usePageTransition: Showing preloader for navigation')
        }
        showPreloaderB()
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 usePageTransition: Preloader already visible, setting up hide logic')
        }
      }

      // Wait for page to actually load before hiding preloader
      // Use requestAnimationFrame to wait for next paint cycle
      const checkPageLoaded = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Give page time to render (2 frames + small delay)
            setTimeout(() => {
              if (isNavigatingRef.current) {
                isNavigatingRef.current = false
                hidePreloaderB()
                setNavigating(false)
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ usePageTransition: Navigation complete, preloader hidden')
                }
              }
            }, 150) // Slightly longer delay to ensure page is fully rendered
          })
        })
      }

      // Start checking after a minimum display time
      // Reduced from 500ms to match preloader duration (0.5s = 500ms)
      const minDisplayTimer = setTimeout(checkPageLoaded, 600) // Minimum 600ms display to ensure smooth transition

      // Safety mechanism: Force hide after maximum time
      const safetyTimer = setTimeout(() => {
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false
          hidePreloaderB()
          setNavigating(false)
        }
      }, 2000) // Maximum 2 seconds

      prevPathnameRef.current = pathname

      return () => {
        clearTimeout(minDisplayTimer)
        clearTimeout(safetyTimer)
      }
    }
  }, [pathname, showPreloaderB, hidePreloaderB, isPreloaderBVisible, setNavigating])

  return { isPreloaderBVisible, hidePreloaderB }
}

