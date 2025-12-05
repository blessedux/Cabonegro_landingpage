'use client'

import { useEffect, useState, useRef, useLayoutEffect, startTransition } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring, useMotionValue, useInView, useReducedMotion } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import Image from 'next/image'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  start?: number
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', className = '', start = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger animation when element becomes visible
          // Reset state so it can animate again
          if (!isVisible) {
            setIsVisible(true)
            setHasAnimated(false)
            setCount(start)
          }
        } else {
          // Reset when element leaves viewport so it can animate again
          setIsVisible(false)
          setHasAnimated(false)
          setCount(start)
          // Cancel any ongoing animation
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
          }
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible, start])

  useEffect(() => {
    if (!isVisible || hasAnimated) return

    let startTime: number | null = null

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * (end - start) + start
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setHasAnimated(true)
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isVisible, end, duration, start, hasAnimated])

  return (
    <div ref={ref} className={className}>
      {prefix}{end === 2.1 ? count.toFixed(1) : Math.round(count)}{suffix}
    </div>
  )
}

export default function Stats() {
  const statsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB, isPreloaderComplete, isPreloaderBVisible } = usePreloader()
  
  // Mobile detection for optimized animations
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  // Debug: Log component mount and initial state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Stats: Component mounted', {
        isPreloaderComplete,
        isPreloaderBVisible,
        pathname,
        hasRef: !!statsRef.current,
        windowReady: typeof window !== 'undefined',
      })
    }
  }, [])
  
  // Detect mobile device
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 768)
      setIsMobile(isMobileDevice)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Stats: Mobile detection', { isMobileDevice, width: window.innerWidth })
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Determine locale from pathname for button text
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const buttonText = locale === 'es' ? 'Explorar Terreno' : locale === 'zh' ? '探索地形' : locale === 'fr' ? 'Explorer le Terrain' : 'Explore Terrain'
  
  // Track previous pathname to detect navigation
  const prevPathnameRef = useRef(pathname)
  // Track previous locale to detect language changes
  const prevLocaleRef = useRef(locale)
  
  // Track if Stats section is in view - resets on navigation
  // Use a more lenient margin to ensure it triggers when scrolling through the area
  // Use pathname as key to force re-initialization on navigation
  const isInView = useInView(statsRef, { 
    margin: "-100% 0px -100% 0px", // Trigger when section enters viewport (even if partially)
    once: false // Allow re-triggering on navigation - critical for fade-in on navigation
  })
  
  // Debug: Log in-view status changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Stats: In-view status changed', {
        isInView,
        isPreloaderComplete,
        isPreloaderBVisible,
        readyToScroll: !isPreloaderBVisible, // Ready as soon as PreloaderB is hidden
      })
    }
  }, [isInView, isPreloaderBVisible, isPreloaderComplete]) // Include isPreloaderComplete for logging only
  
  
  // Navigation handlers - explicitly show preloader for consistent transitions
  const handlePatagonValleyClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Stats: handlePatagonValleyClick - showing preloader before navigation')
    }
    // Show preloader immediately before navigation for consistent UX
    // This must happen synchronously before router.push to prevent white screen
    showPreloaderB()
    // Use startTransition for non-blocking navigation
    startTransition(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Navigating to parque-tecnologico')
      }
      router.push(`/${locale}/parque-tecnologico`)
    })
  }
  
  const handlePortZoneClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Stats: handlePortZoneClick - showing preloader before navigation')
    }
    // Show preloader immediately before navigation for consistent UX
    showPreloaderB()
    // Use startTransition for non-blocking navigation
    startTransition(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Navigating to terminal-maritimo')
      }
      router.push(`/${locale}/terminal-maritimo`)
    })
  }
  
  const handleCaboNegroDosClick = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Stats: handleCaboNegroDosClick - showing preloader before navigation')
    }
    // Show preloader immediately before navigation for consistent UX
    showPreloaderB()
    // Use startTransition for non-blocking navigation
    startTransition(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Navigating to parque-logistico')
      }
      router.push(`/${locale}/parque-logistico`)
    })
  }
  
  // Track scroll progress using statsRef (always defined, avoids hydration errors)
  // Force re-initialization by using pathname as part of the scroll tracking
  const [navigationKey, setNavigationKey] = useState(0)
  
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    const wasHomePage = prevPathnameRef.current === `/${locale}` || prevPathnameRef.current === '/en' || prevPathnameRef.current === '/es' || prevPathnameRef.current === '/zh' || prevPathnameRef.current === '/fr'
    const localeChanged = prevLocaleRef.current !== locale
    
    // Force re-initialization on homepage navigation OR locale change
    if ((isHomePage && !wasHomePage) || (isHomePage && localeChanged)) {
      // Force re-initialization by updating key
      setNavigationKey(prev => prev + 1)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Navigation to homepage or locale change detected, resetting scroll tracking', { navigationKey, localeChanged, locale })
      }
    }
    
    prevPathnameRef.current = pathname
    prevLocaleRef.current = locale
  }, [pathname, locale, navigationKey])
  
  // Use navigationKey to force useScroll to re-initialize
  // This ensures scroll tracking resets properly after navigation
  const { scrollYProgress: baseScrollProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  })
  
  // Reset scroll progress manually when navigation key changes
  useEffect(() => {
    if (navigationKey > 0 && statsRef.current) {
      // Force a recalculation by temporarily hiding and showing
      // This ensures useScroll recalculates the scroll progress
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Forcing scroll progress recalculation', { navigationKey })
      }
    }
  }, [navigationKey])
  
  // Find AboutUs section to potentially adjust scroll calculations
  const aboutUsSectionRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    const findElement = () => {
      const element = document.querySelector('[data-aboutus-section="true"]') as HTMLElement
      if (element) {
        aboutUsSectionRef.current = element
      }
    }
    requestAnimationFrame(findElement)
  }, [])
  
  // For now, use baseScrollProgress as aboutUsScrollProgress
  // The animations should still work since they're based on scroll position
  // If precise AboutUs tracking is needed, we can add manual calculations later
  const aboutUsScrollProgress = baseScrollProgress
  
  // AboutUs content opacity - matches the original AboutUs component
  const aboutUsOpacity = useTransform(aboutUsScrollProgress, [0, 0.01, 0.05, 0.7, 1], [0, 0, 1, 1, 0], { clamp: true })
  const rawAboutUsY = useTransform(aboutUsScrollProgress, [0, 0.01, 0.05, 0.5, 0.7, 1], [80, 80, 0, 0, 0, -50])
  const aboutUsY = useSpring(rawAboutUsY, { 
    stiffness: 80, 
    damping: 25,
    mass: 0.6
  })
  
  // Title opacity for duplicate
  const duplicateTitleOpacity = useTransform(aboutUsScrollProgress, [0, 0.01, 0.04], [0, 0, 1], { clamp: true })
  const rawDuplicateTitleY = useTransform(aboutUsScrollProgress, [0, 0.01, 0.04, 0.5], [60, 60, 0, 0])
  const duplicateTitleY = useSpring(rawDuplicateTitleY, { 
    stiffness: 100, 
    damping: 20,
    mass: 0.5
  })
  
  // Use AboutUs scroll progress for Stats background fade-in
  // This triggers much earlier - during the AboutUs section itself
  const scrollYProgress = aboutUsScrollProgress

  // Track when Partners section reaches 50% of viewport (center line)
  // Use statsRef as the target to avoid hydration errors - it's always attached to a valid element
  // We'll manually find the Partners section for any future calculations if needed
  const partnersSectionRef = useRef<HTMLElement | null>(null)
  
  // Find Partners section for potential future use (not used in useScroll to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const element = document.querySelector('[data-partners-section="true"]') as HTMLElement
      if (element) {
        partnersSectionRef.current = element
      }
    }
  }, [])
  
  // Track Partners section scroll progress
  // Use a more delayed offset - only start tracking when Partners section is actually approaching
  // Changed from ["start center", "start start"] to ["end center", "end start"] to delay the trigger
  const { scrollYProgress: partnersScrollProgress } = useScroll({
    target: statsRef,
    offset: ["end center", "end start"] // Start tracking later - when Stats end reaches center
  })

  // Background fade in - starts later at 0.40 (40% of AboutUs scroll), completes at 0.60 (60%)
  // Adjusted for shorter AboutUs section (100vh) - trigger earlier
  // Start fading in when AboutUs is at 20% scroll progress (earlier than before)
  const backgroundOpacity = useTransform(
    scrollYProgress, 
    [0, 0.20, 0.40], 
    [0, 0, 1],
    { clamp: true }
  )
  
  // Background zoom effect - scales from 1 to 1.1 (10% zoom) as we scroll from top to bottom
  // Only apply zoom when background starts appearing
  // Always call hooks unconditionally - use static value for mobile, transform for desktop
  const backgroundScaleStatic = useMotionValue(1) // No zoom effect on mobile
  const backgroundScaleTransform = useTransform(
    scrollYProgress, 
    [0, 0.20, 1], 
    [1, 1, 1.1], 
    { clamp: true }
  )
  const backgroundScale = isMobile ? backgroundScaleStatic : backgroundScaleTransform
  
  // Black overlay opacity - starts when background starts fading in (40% to 60%)
  const blackOverlayOpacity = useTransform(
    scrollYProgress, 
    [0, 0.40, 0.60], 
    [0, 0, 1],
    { clamp: true }
  )
  
  // Title fade in - starts when background and content start fading in (20%)
  // On mobile, title should appear at the same time as cards for better UX
  const titleOpacity = useTransform(
    scrollYProgress, 
    [0, 0.20, 0.30], 
    [0, 0, 1],
    { clamp: true }
  )
  // Always call hooks unconditionally - use static value for mobile, transform for desktop
  const titleYStatic = useMotionValue(0) // No parallax on mobile
  const titleYTransform = useTransform(
    scrollYProgress, 
    [0, 0.20, 0.30], 
    [0, 0, 0],
    { clamp: true }
  )
  const titleY = isMobile ? titleYStatic : titleYTransform
  
  // Content fade in - start earlier to match stat cards (0.20 when background starts)
  const contentOpacity = useTransform(
    scrollYProgress, 
    [0, 0.20, 0.30], 
    [0, 0, 1],
    { clamp: true }
  )
  // Always call hooks unconditionally - use static value for mobile, transform for desktop
  const contentYStatic = useMotionValue(0) // No parallax on mobile
  const contentYTransform = useTransform(
    scrollYProgress, 
    [0, 0.20, 0.30], 
    [0, 0, 0],
    { clamp: true }
  )
  const contentY = isMobile ? contentYStatic : contentYTransform
  
  // Position orange container at the very top, close to AboutUs component
  // At 0%: container at top (top: 0, y: 0)
  // At 40%: container positioned at very top (top: 0%, y: -50%) - at the very top
  // After 40%: stays in position
  const containerTop = useTransform(
    scrollYProgress, 
    [0, 0.40, 0.60], 
    ['0%', '0%', '0%'], 
    { clamp: true }
  )
  // Always call hooks unconditionally - use static value for mobile, transform for desktop
  const containerYStatic = useMotionValue('0%') // Static positioning on mobile
  const containerYTransform = useTransform(
    scrollYProgress, 
    [0, 0.40, 0.60], 
    ['0%', '-50%', '-50%'], 
    { clamp: true }
  )
  const containerY = isMobile ? containerYStatic : containerYTransform
  
  // Overall Stats section visibility - hide completely until AboutUs is in view
  // This ensures Stats doesn't show before AboutUs section is reached
  // Also check if section is in view to ensure it fades in on navigation
  const statsSectionOpacity = useTransform(
    scrollYProgress,
    [0, 0.01],
    [0, 1],
    { clamp: true }
  )
  
  // Simplified visibility - always show when in viewport, regardless of scroll progress
  const [forceVisible, setForceVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  // Reset state when locale changes to ensure animations work correctly
  useEffect(() => {
    setForceVisible(false)
    setHasScrolled(false)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Stats: Locale changed, resetting visibility state', { locale })
    }
  }, [locale])
  
  // Monitor scroll events to detect when user scrolls
  // Only block if PreloaderB is actually visible - don't wait for isPreloaderComplete
  // This makes Stats component ready as soon as PreloaderB hides
  useEffect(() => {
    if (isPreloaderBVisible) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Stats: Scroll monitoring blocked - PreloaderB is visible', {
          isPreloaderBVisible,
        })
      }
      return
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Stats: Scroll monitoring enabled - ready to scroll', {
        isPreloaderComplete,
        isPreloaderBVisible,
        hasRef: !!statsRef.current,
        ready: !isPreloaderBVisible, // Ready if PreloaderB is not visible
      })
    }
    
    const handleScroll = () => {
      setHasScrolled(true)
      
      if (!statsRef.current) return
      
      const rect = statsRef.current.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isVisible) {
        setForceVisible(true)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Stats: Scrolled to section, forcing visibility', {
            rectTop: rect.top,
            rectBottom: rect.bottom,
            windowHeight: window.innerHeight,
          })
        }
      }
    }
    
    // Check immediately and on scroll
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isPreloaderBVisible, navigationKey, locale]) // Only depend on isPreloaderBVisible, not isPreloaderComplete
  
  // Monitor in-view status - this is the primary trigger for visibility
  // Only check if PreloaderB is not visible - don't wait for isPreloaderComplete
  useEffect(() => {
    if (isInView && !isPreloaderBVisible) {
      setForceVisible(true)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Stats: Section in view, forcing visibility', {
          isInView,
          isPreloaderBVisible,
          ready: !isPreloaderBVisible,
        })
      }
    }
  }, [isInView, isPreloaderBVisible, navigationKey, locale]) // Only depend on isPreloaderBVisible
  
  // Also monitor scroll progress as secondary trigger
  // Only check if PreloaderB is not visible - don't wait for isPreloaderComplete
  useMotionValueEvent(statsSectionOpacity, "change", (latest) => {
    if (latest > 0.01 && !isPreloaderBVisible) {
      setForceVisible(true)
      if (process.env.NODE_ENV === 'development' && !forceVisible) {
        console.log('✅ Stats: Scroll progress > 0.01, forcing visibility', {
          latest,
          isPreloaderBVisible,
          ready: !isPreloaderBVisible,
        })
      }
    }
  })
  
  // Reset when navigating to homepage
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    const wasHomePage = prevPathnameRef.current === `/${locale}` || prevPathnameRef.current === '/en' || prevPathnameRef.current === '/es' || prevPathnameRef.current === '/zh' || prevPathnameRef.current === '/fr'
    
    if (isHomePage && !wasHomePage) {
      // Reset on navigation to home
      setForceVisible(false)
      setHasScrolled(false)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Stats: Reset visibility on homepage navigation')
      }
      
      // Check visibility after navigation with multiple attempts
      // Only check if PreloaderB is not visible - don't wait for isPreloaderComplete
      const timers: NodeJS.Timeout[] = []
      
      timers.push(setTimeout(() => {
        if (statsRef.current && !isPreloaderBVisible) {
          const rect = statsRef.current.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          if (isVisible) {
            setForceVisible(true)
          }
        }
      }, 300))
      
      timers.push(setTimeout(() => {
        if (statsRef.current && !isPreloaderBVisible) {
          const rect = statsRef.current.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          if (isVisible) {
            setForceVisible(true)
          }
        }
      }, 1000))
      
      return () => {
        timers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [pathname, locale, isPreloaderBVisible, navigationKey]) // Only depend on isPreloaderBVisible
  
  // Fade to white when Partners section approaches
  // Partners scroll progress: 0 = Stats end at center, 1 = Stats end at top
  // Delay the white overlay significantly - only start fading when Partners is very close (at 0.7 progress)
  // and complete when Stats end reaches top (at 1.0 progress)
  // This ensures the white overlay only appears right before Partners section
  const whiteOverlayOpacity = useTransform(partnersScrollProgress, [0.7, 1], [0, 1], { clamp: true })

  // Staggered fade-in animations for stat boxes
  // On mobile: animate all boxes simultaneously (no stagger) for better performance
  // On desktop: use staggered animation for visual interest
  // Reduced motion: disable Y transform and use simpler fade-in
  // Mobile: no Y transforms at all - only opacity fade-in
  const yTransformDistance = prefersReducedMotion ? 0 : (isMobile ? 0 : 30)
  
  // Mobile: all boxes use same range [0.20, 0.30] (no stagger)
  // Desktop: staggered ranges [0.20, 0.30], [0.22, 0.32], [0.24, 0.34]
  const statBox1Range: [number, number] = isMobile ? [0.20, 0.30] : [0.20, 0.30]
  const statBox2Range: [number, number] = isMobile ? [0.20, 0.30] : [0.22, 0.32]
  const statBox3Range: [number, number] = isMobile ? [0.20, 0.30] : [0.24, 0.34]
  
  const statBox1Opacity = useTransform(scrollYProgress, statBox1Range, [0, 1], { clamp: true })
  // Always call hooks unconditionally - use static value for mobile, transform for desktop
  const statBox1YStatic = useMotionValue(0) // Static value for mobile
  const statBox1YTransform = useTransform(scrollYProgress, statBox1Range, [yTransformDistance, 0], { clamp: true })
  const statBox1Y = isMobile ? statBox1YStatic : statBox1YTransform
  
  const statBox2Opacity = useTransform(scrollYProgress, statBox2Range, [0, 1], { clamp: true })
  const statBox2YStatic = useMotionValue(0) // Static value for mobile
  const statBox2YTransform = useTransform(scrollYProgress, statBox2Range, [yTransformDistance, 0], { clamp: true })
  const statBox2Y = isMobile ? statBox2YStatic : statBox2YTransform
  
  const statBox3Opacity = useTransform(scrollYProgress, statBox3Range, [0, 1], { clamp: true })
  const statBox3YStatic = useMotionValue(0) // Static value for mobile
  const statBox3YTransform = useTransform(scrollYProgress, statBox3Range, [yTransformDistance, 0], { clamp: true })
  const statBox3Y = isMobile ? statBox3YStatic : statBox3YTransform

  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(false)
  const [shouldShowStats, setShouldShowStats] = useState(false)
  
  useMotionValueEvent(contentOpacity, "change", (latest) => {
    // Only block pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })
  
  useMotionValueEvent(statsSectionOpacity, "change", (latest) => {
    // Only show Stats section when AboutUs is in view
    setShouldShowStats(latest > 0.1)
    
    // Debug: Log opacity changes
    if (process.env.NODE_ENV === 'development' && latest > 0.01) {
      console.log('📊 Stats: Section opacity changed', {
        opacity: latest,
        shouldShow: latest > 0.1,
        isPreloaderComplete,
        isPreloaderBVisible,
      })
    }
  })
  
  // Debug: Check asset loading status
  // Check assets as soon as PreloaderB is hidden, don't wait for isPreloaderComplete
  useEffect(() => {
    if (typeof window === 'undefined' || isPreloaderBVisible) return
    
    const checkAssets = () => {
      const images = document.querySelectorAll('img')
      const loadedImages: HTMLImageElement[] = []
      const loadingImages: HTMLImageElement[] = []
      
      images.forEach((img) => {
        if (img.complete) {
          loadedImages.push(img as HTMLImageElement)
        } else {
          loadingImages.push(img as HTMLImageElement)
        }
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Stats: Asset loading status', {
          totalImages: images.length,
          loadedImages: loadedImages.length,
          loadingImages: loadingImages.length,
          allAssetsLoaded: loadingImages.length === 0,
          readyToScroll: !isPreloaderBVisible && loadingImages.length === 0,
        })
      }
    }
    
    // Check immediately
    checkAssets()
    
    // Check after a short delay to catch late-loading images
    const timer = setTimeout(checkAssets, 500)
    
    // Also check when images load
    const images = document.querySelectorAll('img')
    const imageLoadHandlers: (() => void)[] = []
    
    images.forEach((img) => {
      if (!img.complete) {
        const handler = () => {
          checkAssets()
          img.removeEventListener('load', handler)
        }
        img.addEventListener('load', handler)
        imageLoadHandlers.push(handler)
      }
    })
    
    return () => {
      clearTimeout(timer)
      images.forEach((img, index) => {
        if (imageLoadHandlers[index]) {
          img.removeEventListener('load', imageLoadHandlers[index])
        }
      })
    }
  }, [isPreloaderBVisible]) // Only depend on isPreloaderBVisible
  
  // Debug: Overall readiness check
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const readyToScroll = !isPreloaderBVisible // Ready as soon as PreloaderB is hidden
      const readiness = {
        componentMounted: true,
        preloaderComplete: isPreloaderComplete,
        preloaderBVisible: isPreloaderBVisible,
        hasRef: !!statsRef.current,
        isInView,
        readyToScroll, // Ready as soon as PreloaderB is hidden
        scrollProgress: baseScrollProgress.get(),
        statsSectionOpacity: statsSectionOpacity.get(),
      }
      
      console.log('📊 Stats: Overall readiness check', readiness)
      
      if (readyToScroll && !isPreloaderBVisible) {
        console.log('✅ Stats: READY TO SCROLL - Component is loaded and ready')
      } else {
        console.log('⏳ Stats: NOT READY - Waiting for:', {
          preloaderBVisible: isPreloaderBVisible,
        })
      }
    }
  }, [isPreloaderBVisible, isInView, baseScrollProgress, statsSectionOpacity]) // Removed isPreloaderComplete dependency

  return (
    <>
      {/* Stats section - sticky positioning to allow scrolling */}
      <motion.section 
        id="stats"
        ref={statsRef} 
        className="sticky top-0 left-0 right-0 z-[3] pointer-events-none"
        style={{
          zIndex: 3,
          opacity: (() => {
            // Only block if PreloaderB is actually visible - don't wait for isPreloaderComplete
            if (isPreloaderBVisible) return 0
            
            // Get scroll-based opacity
            const scrollOpacity = statsSectionOpacity.get()
            
            // If force visible (in viewport or scrolled), ensure minimum visibility
            // This ensures fade-in works even after navigation
            if (forceVisible || isInView || hasScrolled) {
              const minOpacity = Math.max(scrollOpacity, 0.3)
              if (process.env.NODE_ENV === 'development' && minOpacity > 0 && scrollOpacity < 0.01) {
                console.log('✅ Stats: Using force visibility', { forceVisible, isInView, hasScrolled, scrollOpacity, minOpacity })
              }
              return minOpacity
            }
            
            // Otherwise use scroll-based opacity
            return scrollOpacity
          })(),
          pointerEvents: (!isPreloaderBVisible && (shouldShowStats || forceVisible || isInView || hasScrolled || statsSectionOpacity.get() > 0.1)) ? 'auto' : 'none',
          visibility: !isPreloaderBVisible ? 'visible' : 'hidden', // Only hide if PreloaderB is visible
          // Fix mobile viewport height issues - add extra height on mobile to prevent Partners from covering last card
          minHeight: isMobile ? 'calc(100vh + 250px)' : '100vh',
          height: isMobile ? 'calc(100vh + 250px)' : '100vh',
          maxHeight: isMobile ? 'calc(100vh + 250px)' : '100vh'
        }}
      >
        {/* Content container - positioned at top, centers in viewport when background fades in (40% scroll) */}
        {/* This should be above AboutUs content when Stats is fully visible */}
        <motion.div
          className="absolute left-0 right-0 w-full flex flex-col justify-start"
          style={{
            pointerEvents: shouldBlockPointer ? 'auto' : 'none',
            top: containerTop,
            y: isMobile ? 0 : containerY, // Only apply Y transform on desktop
            zIndex: 7 // Above AboutUs content (z-[6]) so Stats content appears on top when visible
          }}
        >
          
          {/* Content wrapper - no margins, matches section positioning, content at top */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-0">
            {/* Land Development Structure Title - moved to top position */}
            <motion.div 
              className="text-center mb-[20vh] md:mb-[30vh] relative"
              style={{
                opacity: titleOpacity,
                y: isMobile ? 0 : titleY, // Only apply Y transform on desktop
                willChange: isMobile ? 'opacity' : 'transform, opacity' // Optimize for mobile
              }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                {locale === 'es' ? 'Estructura de Desarrollo de Tierras' : locale === 'zh' ? '土地开发结构' : locale === 'fr' ? 'Structure de Développement des Terres' : 'Land Development Structure'}
              </h2>
              <div className="max-w-3xl mx-auto mb-2">
                <MagicText 
                  text={locale === 'es'
                    ? 'Desglose completo del desarrollo de tierras en la zona industrial y marítima estratégica de Cabo Negro'
                    : locale === 'zh'
                    ? '卡波内格罗战略工业和海事区土地开发的全面细分'
                    : locale === 'fr'
                    ? 'Répartition complète du développement des terres dans la zone industrielle et maritime stratégique de Cabo Negro'
                    : 'Comprehensive land development breakdown across Cabo Negro\'s strategic industrial and maritime zone'}
                  className="text-gray-300 text-lg"
                />
              </div>
            </motion.div>
            
            {/* Content section - fades in when background appears (11%) */}
            <motion.div
              className="relative"
              style={{
                opacity: contentOpacity,
                y: isMobile ? 0 : contentY, // Only apply Y transform on desktop
                willChange: isMobile ? 'opacity' : 'transform, opacity' // Optimize for mobile
              }}
            >

              {/* Total Hectares - Featured */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center p-8 bg-black/50 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl">
                  <div className="text-6xl md:text-7xl font-bold mb-4 text-white">
                    <AnimatedCounter end={300} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium mb-2">
                    {locale === 'es' ? 'Hectáreas Totales' : locale === 'zh' ? '总公顷数' : locale === 'fr' ? 'Hectares Totaux' : 'Total Hectares'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {locale === 'es' ? 'Zona de Desarrollo Industrial y Marítimo' : locale === 'zh' ? '工业和海事开发区' : locale === 'fr' ? 'Zone de Développement Industriel et Maritime' : 'Industrial & Maritime Development Zone'}
                  </p>
                </div>
              </div>

            {/* Company/Area Breakdown - 3 Cards Layout: 1 top, 2 bottom */}
            <div className="space-y-4 md:space-y-6">
              {/* Top Row: Patagon Valley (centered) */}
              <div className="flex justify-center">
                <motion.div 
                  className="relative w-full max-w-md rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
                  style={{
                    opacity: statBox1Opacity,
                    y: isMobile ? 0 : statBox1Y, // Only apply Y transform on desktop
                    willChange: isMobile ? 'opacity' : 'transform, opacity' // Optimize for mobile
                  }}
                  onClick={handlePatagonValleyClick}
                  onMouseEnter={() => router.prefetch(`/${locale}/parque-tecnologico`)}
                >
                  {/* Background Image - Optimized with next/image */}
                  <div className="absolute inset-0">
                    <Image
                      src="/image13.webp"
                      alt="Patagon Valley"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 448px"
                      priority={false}
                    />
                  </div>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content - Logo only, centered and larger */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Logo Icon - Twice the size, centered */}
                    <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                      <Image 
                        src="/logos/patagon_white.png" 
                        alt="Patagon Valley Logo" 
                        fill
                        className="object-contain"
                        loading="lazy"
                        sizes="(max-width: 768px) 160px, 192px"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row: Terminal Marítimo and Cabo Negro Dos (2 cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                {/* Terminal Marítimo */}
                <motion.div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
                  style={{
                    opacity: statBox2Opacity,
                    y: isMobile ? 0 : statBox2Y, // Only apply Y transform on desktop
                    willChange: isMobile ? 'opacity' : 'transform, opacity' // Optimize for mobile
                  }}
                  onClick={handlePortZoneClick}
                  onMouseEnter={() => router.prefetch(`/${locale}/terminal-maritimo`)}
                >
                  {/* Background Image - Optimized with next/image */}
                  <div className="absolute inset-0">
                    <Image
                      src="/image15.webp"
                      alt="Terminal Marítimo"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </div>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content - Logo only, centered and larger */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Logo Icon - Twice the size, centered, using white logo */}
                    <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                      <Image 
                        src="/logos/CaboNegro_logo_white.png" 
                        alt="Cabo Negro Logo" 
                        fill
                        className="object-contain"
                        loading="lazy"
                        sizes="(max-width: 768px) 160px, 192px"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Cabo Negro Dos */}
                <motion.div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
                  style={{
                    opacity: statBox3Opacity,
                    y: isMobile ? 0 : statBox3Y, // Only apply Y transform on desktop
                    willChange: isMobile ? 'opacity' : 'transform, opacity' // Optimize for mobile
                  }}
                  onClick={handleCaboNegroDosClick}
                  onMouseEnter={() => router.prefetch(`/${locale}/parque-logistico`)}
                >
                  {/* Background Image - Optimized with next/image */}
                  <div className="absolute inset-0">
                    <Image
                      src="/image16.webp"
                      alt="Cabo Negro Dos"
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </div>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content - Custom three-line text with DOS emphasized */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Line 1: CaboNegro */}
                    <div className="text-white text-lg md:text-xl font-medium mb-2">
                      CaboNegro
                    </div>
                    
                    {/* Line 2: DOS - Much bigger font */}
                    <div className="text-white text-6xl md:text-7xl lg:text-8xl font-bold mb-2 leading-none">
                      DOS
                    </div>
                    
                    {/* Line 3: M  A C  R  O  L  O  T  E with spaces */}
                    <div className="text-white text-lg md:text-xl font-medium tracking-wider">
                      M  A C  R  O  L  O  T  E
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Background image layer - fades in based on scroll with zoom effect */}
        {/* This should be below AboutUs content but above Hero */}
        <motion.div
          className="fixed inset-0"
          style={{
            backgroundImage: 'url(/cabonegro_wirefram2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity,
            scale: backgroundScale,
            zIndex: 2 // Below AboutUs content (z-4) but above Hero (z-1)
          }}
        />
        
        {/* Black overlay that increases as we scroll - only visible when Stats section is active */}
        <motion.div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: blackOverlayOpacity,
            zIndex: 2 // Same as background
          }}
        />
        
        {/* White overlay - fades in when Partners starts reaching top */}
        {/* Only affects background, content stays visible above it */}
        <motion.div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 1)',
            opacity: whiteOverlayOpacity,
            zIndex: 3 // Same as background layer, below content (z-7)
          }}
        />
      </motion.section>
    </>
  )
}