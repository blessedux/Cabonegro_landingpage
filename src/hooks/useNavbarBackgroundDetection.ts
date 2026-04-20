import { useState, useEffect, useRef } from 'react'

/**
 * Optimized hook for detecting when navbar is over white background sections.
 * Uses throttled requestAnimationFrame and caches DOM queries for performance.
 */
export function useNavbarBackgroundDetection(
  navbarRef: React.RefObject<HTMLElement>,
  pathname: string
) {
  const [isOverWhiteBackground, setIsOverWhiteBackground] = useState(false)

  // Cache DOM element references to avoid repeated queries
  const cachedElementsRef = useRef<{
    heroSection: Element | null
    partnersSection: Element | null
    keepBlackSections: NodeListOf<Element> | null
    whiteSections: NodeListOf<Element> | null
    lastPathname: string
  }>({
    heroSection: null,
    partnersSection: null,
    keepBlackSections: null,
    whiteSections: null,
    lastPathname: ''
  })

  // Update cached elements when pathname changes
  useEffect(() => {
    if (cachedElementsRef.current.lastPathname !== pathname) {
      cachedElementsRef.current.heroSection = document.querySelector('[data-hero-section="true"]')
      cachedElementsRef.current.partnersSection = document.querySelector('[data-partners-section="true"]')
      cachedElementsRef.current.keepBlackSections = document.querySelectorAll('[data-keep-navbar-black="true"]')
      cachedElementsRef.current.whiteSections = document.querySelectorAll('[data-white-background="true"]')
      cachedElementsRef.current.lastPathname = pathname
    }
  }, [pathname])

  useEffect(() => {
    if (!navbarRef.current) return

    const checkBackground = () => {
      if (!navbarRef.current) return

      if (pathname.includes('/contact')) {
        setIsOverWhiteBackground(true)
        return
      }

      const scrollY = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const navbarRect = navbarRef.current.getBoundingClientRect()
      const navbarTop = navbarRect.top
      const navbarBottom = navbarRect.bottom
      const navbarCenterY = navbarRect.top + navbarRect.height / 2

      // SPECIAL HANDLING FOR TERMINAL-MARITIMO PAGE
      if (pathname.includes('/terminal-maritimo')) {
        const heroSection = cachedElementsRef.current.heroSection
        if (heroSection) {
          const heroRect = heroSection.getBoundingClientRect()
          // If navbar is over or within the hero section, use white text (dark background)
          if (navbarBottom <= heroRect.bottom) {
            setIsOverWhiteBackground(false)
            return
          }
          // If navbar is below hero section, check if over white background sections
          const whiteSections = cachedElementsRef.current.whiteSections
          if (whiteSections) {
            let isOverWhite = false
            for (let i = 0; i < whiteSections.length; i++) {
              const section = whiteSections[i]
              const rect = section.getBoundingClientRect()
              if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
                isOverWhite = true
                break
              }
            }
            setIsOverWhiteBackground(isOverWhite)
            return
          }
        }
      }

      // FIRST: Check if we've scrolled to or past the Partners section
      const partnersSection = cachedElementsRef.current.partnersSection
      if (partnersSection) {
        const partnersRect = partnersSection.getBoundingClientRect()
        if (partnersRect.top <= navbarBottom) {
          setIsOverWhiteBackground(true)
          return
        }
      }

      // SECOND: Check if we're near the bottom of the page (where footer usually is)
      const scrollPercentage = (scrollY + windowHeight) / documentHeight
      if (scrollPercentage > 0.7) {
        setIsOverWhiteBackground(true)
        return
      }

      // THIRD: Check if navbar is over sections that should keep navbar black
      const keepBlackSections = cachedElementsRef.current.keepBlackSections
      if (keepBlackSections && keepBlackSections.length > 0) {
        for (let i = 0; i < keepBlackSections.length; i++) {
          const section = keepBlackSections[i]
          const rect = section.getBoundingClientRect()

          // More reliable overlap detection
          const isOverlapping = (
            (navbarTop >= rect.top - 150 && navbarTop <= rect.bottom + 150) ||
            (navbarBottom >= rect.top - 150 && navbarBottom <= rect.bottom + 150) ||
            (navbarTop <= rect.top && navbarBottom >= rect.bottom) ||
            (navbarCenterY >= rect.top - 150 && navbarCenterY <= rect.bottom + 150) ||
            (rect.top <= windowHeight && rect.bottom >= 0 &&
              Math.abs(navbarCenterY - (rect.top + rect.bottom) / 2) < 300) ||
            (navbarBottom >= rect.top - 200 && navbarBottom <= rect.top) ||
            (navbarTop <= rect.bottom + 200 && navbarTop >= rect.bottom)
          )

          if (isOverlapping) {
            setIsOverWhiteBackground(true)
            return
          }
        }
      }

      // FOURTH: Only check white background sections if we're NOT over a keep-black section
      const whiteSections = cachedElementsRef.current.whiteSections
      if (whiteSections) {
        let isOverWhite = false
        for (let i = 0; i < whiteSections.length; i++) {
          const section = whiteSections[i]
          // Skip if this section also has keep-navbar-black attribute
          if (section.hasAttribute('data-keep-navbar-black')) {
            continue
          }
          const rect = section.getBoundingClientRect()
          if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
            isOverWhite = true
            break
          }
        }
        setIsOverWhiteBackground(isOverWhite)
      }
    }

    // Use throttled requestAnimationFrame instead of setInterval
    // This ensures we only check at most once per frame (60fps max)
    let rafId: number | null = null
    let lastCheckTime = 0
    const THROTTLE_MS = 16 // ~60fps

    const handleScroll = () => {
      const now = performance.now()
      if (now - lastCheckTime < THROTTLE_MS) {
        // Skip if called too soon
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            lastCheckTime = performance.now()
            checkBackground()
            rafId = null
          })
        }
        return
      }

      lastCheckTime = now
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(() => {
        checkBackground()
        rafId = null
      })
    }

    // Initial check
    checkBackground()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkBackground, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkBackground)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [pathname, navbarRef])

  return isOverWhiteBackground
}
