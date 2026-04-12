import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'

/**
 * Consolidated hook for managing navbar visibility.
 * Handles preloader coordination and special page visibility.
 */
export function useNavbarVisibility() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const { isNavbarHidden, setIsNavbarHidden } = useAnimation()
  const {
    isPreloaderVisible,
    isPreloaderComplete,
    isPreloaderBVisible,
  } = usePreloader()

  // Check if we're on a special page that should show navbar immediately
  const isSpecialPage = pathname.includes('/deck') ||
    pathname.includes('/explore') ||
    pathname.includes('/contact') ||
    pathname.includes('/terminal-maritimo')

  // Consolidated visibility effect
  useEffect(() => {
    // For special pages, show immediately without animation
    if (isSpecialPage) {
      setIsNavbarHidden(false)
      setIsVisible(true)
      return
    }

    // For other pages, ensure navbar is not hidden
    setIsNavbarHidden(false)

    // Check both old preloader system (isPreloaderComplete) and new preloader system (isPreloaderBVisible)
    const preloaderComplete = (isPreloaderComplete && !isPreloaderVisible) || !isPreloaderBVisible

    if (preloaderComplete) {
      // Ensure navbar starts hidden, then animate down smoothly
      setIsVisible(false)

      // Use requestAnimationFrame for immediate show (next frame)
      // No artificial delay - transition will trigger naturally
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      // Keep navbar hidden while preloader is visible
      setIsVisible(false)
    }
  }, [
    isPreloaderComplete,
    isPreloaderVisible,
    isPreloaderBVisible,
    pathname,
    setIsNavbarHidden,
    isSpecialPage,
  ])

  // Safety mechanism: periodic check to ensure navbar is always visible and clickable
  useEffect(() => {
    // Only check if preloader is not visible (page has loaded)
    if (isPreloaderBVisible) return

    const checkInterval = setInterval(() => {
      const shouldBeVisible = !isPreloaderBVisible && !isPreloaderVisible

      if (shouldBeVisible && !isVisible) {
        setIsVisible(true)
        setIsNavbarHidden(false)
      }
    }, 500) // Check every 500ms

    return () => clearInterval(checkInterval)
  }, [isVisible, isPreloaderBVisible, isPreloaderVisible, setIsNavbarHidden])

  return {
    isVisible,
    isNavbarHidden,
    isPreloaderVisible,
  }
}
