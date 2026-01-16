'use client'

import { useEffect, useState, useRef } from 'react'
import { flushSync } from 'react-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
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
  
  // Track if hero video is loaded and ready - prevents Stats background from showing before video
  const [heroVideoReady, setHeroVideoReady] = useState(false)
  
  // Check if hero video is loaded and ready
  useEffect(() => {
    // Don't check until preloader is hidden - video won't be loading until then
    if (isPreloaderBVisible) {
      setHeroVideoReady(false)
      return
    }
    
    const checkHeroVideo = () => {
      // Find the hero video element - look for video in fixed section
      const heroSection = document.querySelector('section[class*="fixed"][class*="top-0"]')
      const heroVideo = heroSection?.querySelector('video') as HTMLVideoElement
      
      if (heroVideo) {
        // Check if video has loaded enough data to play
        // readyState 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
        const hasEnoughData = heroVideo.readyState >= 3
        
        if (hasEnoughData) {
          setHeroVideoReady(true)
          return true
        }
      }
      
      return false
    }
    
    // Wait a bit for video element to be created after preloader hides
    const initialDelay = setTimeout(() => {
      // Check immediately after delay
      if (checkHeroVideo()) {
        return
      }
      
      // If not ready, find video and listen for events
      const heroSection = document.querySelector('section[class*="fixed"][class*="top-0"]')
      const heroVideo = heroSection?.querySelector('video') as HTMLVideoElement
      
      if (heroVideo) {
        const handleCanPlay = () => {
          setHeroVideoReady(true)
        }
        
        const handleLoadedData = () => {
          setHeroVideoReady(true)
        }
        
        // If already ready, set immediately
        if (heroVideo.readyState >= 3) {
          setHeroVideoReady(true)
        } else {
          // Listen for ready events
          heroVideo.addEventListener('canplay', handleCanPlay, { once: true })
          heroVideo.addEventListener('loadeddata', handleLoadedData, { once: true })
          heroVideo.addEventListener('playing', handleCanPlay, { once: true })
        }
      }
      
      // Also poll for video readiness as fallback (check every 100ms for max 2 seconds)
      let pollCount = 0
      const maxPolls = 20 // 2 seconds max
      
      const pollInterval = setInterval(() => {
        pollCount++
        if (checkHeroVideo() || pollCount >= maxPolls) {
          clearInterval(pollInterval)
          // If max polls reached and still not ready, allow it anyway (video might be slow)
          if (pollCount >= maxPolls && !heroVideoReady) {
            setHeroVideoReady(true)
          }
        }
      }, 100)
      
      return () => {
        clearInterval(pollInterval)
      }
    }, 200) // Small delay to allow video element to be created
    
    return () => {
      clearTimeout(initialDelay)
    }
  }, [isPreloaderBVisible]) // Re-check when preloader visibility changes
  
  // Mobile detection for optimized animations
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  // Detect mobile device
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 768)
      setIsMobile(isMobileDevice)
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
  
  // Navigation handlers - explicitly show preloader for consistent transitions
  const handlePatagonValleyClick = () => {
    // CRITICAL: Show preloader INSTANTLY - use flushSync to force immediate state update
    flushSync(() => {
      showPreloaderB()
    })
    // Navigate IMMEDIATELY - no delays
    router.push(`/${locale}/parque-tecnologico`)
  }
  
  const handlePortZoneClick = () => {
    // CRITICAL: Show preloader INSTANTLY - use flushSync to force immediate state update
    flushSync(() => {
      showPreloaderB()
    })
    // Navigate IMMEDIATELY - no delays
    router.push(`/${locale}/terminal-maritimo`)
  }
  
  const handleCaboNegroDosClick = () => {
    // CRITICAL: Show preloader INSTANTLY - use flushSync to force immediate state update
    flushSync(() => {
      showPreloaderB()
    })
    // Navigate IMMEDIATELY - no delays
    router.push(`/${locale}/parque-logistico`)
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
    }
    
    prevPathnameRef.current = pathname
    prevLocaleRef.current = locale
  }, [pathname, locale, navigationKey])
  
  // Removed all scroll-based animations - everything is always visible
  
  // Simplified visibility - always show when in viewport, regardless of scroll progress
  const [forceVisible, setForceVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  // Reset state when locale changes to ensure animations work correctly
  useEffect(() => {
    setForceVisible(false)
    setHasScrolled(false)
  }, [locale])
  
  // Monitor scroll events to detect when user scrolls
  // Only block if PreloaderB is actually visible - don't wait for isPreloaderComplete
  // This makes Stats component ready as soon as PreloaderB hides
  useEffect(() => {
    if (isPreloaderBVisible) {
      return
    }
    
    const handleScroll = () => {
      setHasScrolled(true)
      
      if (!statsRef.current) return
      
      const rect = statsRef.current.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isVisible) {
        setForceVisible(true)
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
    }
  }, [isInView, isPreloaderBVisible, navigationKey, locale]) // Only depend on isPreloaderBVisible

  // Removed scroll-based visibility monitoring - content is always visible when in viewport
  
  // Reset when navigating to homepage
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === '/en' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    const wasHomePage = prevPathnameRef.current === `/${locale}` || prevPathnameRef.current === '/en' || prevPathnameRef.current === '/es' || prevPathnameRef.current === '/zh' || prevPathnameRef.current === '/fr'
    
    if (isHomePage && !wasHomePage) {
      // Reset on navigation to home
      setForceVisible(false)
      setHasScrolled(false)
      
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
  // All content is always visible - no scroll-based animations
  
  // Hover state for card interactions
  const [isHovered1, setIsHovered1] = useState(false)
  const [isHovered2, setIsHovered2] = useState(false)
  const [isHovered3, setIsHovered3] = useState(false)

  // Check asset loading status
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
  

  return (
    <>
      {/* Stats section - normal flow positioning */}
      <motion.section 
        id="stats"
        ref={statsRef} 
        className="relative w-full"
        style={{
          zIndex: 2, // Normal z-index for document flow
          isolation: 'isolate', // Create new stacking context
          position: 'relative', // Normal document flow
          opacity: (!isPreloaderBVisible && heroVideoReady) ? 1 : 0, // Always visible when preloader is hidden and video is ready
          // Enable pointer events when Stats is visible - allow interaction with content
          pointerEvents: (!isPreloaderBVisible && heroVideoReady) ? 'auto' : 'none',
          visibility: 'visible', // DEBUG: Always visible to see if it's rendering
          // Use minHeight to ensure content fits - 20% larger than before
          minHeight: isMobile ? 'calc((100vh + 400px) * 1.2)' : 'calc((100vh + 300px) * 1.2)',
          paddingTop: isMobile ? '4rem' : '6rem', // Top padding for content
          paddingBottom: isMobile ? '10rem' : '8rem', // Extra padding at bottom to prevent cropping
          overflow: 'hidden' // Ensure content stays within section bounds
        }}
      >
        {/* Content container - positioned at top, centers in viewport when background fades in (40% scroll) */}
        {/* This should be above AboutUs content when Stats is fully visible */}
        {/* Completely hidden until preloader is hidden AND hero video is ready */}
        <motion.div
          className="relative w-full flex flex-col justify-start"
          style={{
            pointerEvents: 'auto',
            zIndex: 7, // Above AboutUs content (z-[6]) so Stats content appears on top when visible
            opacity: (isPreloaderBVisible || !heroVideoReady) ? 0 : 1, // Force 0 when preloader visible OR video not ready
            visibility: (isPreloaderBVisible || !heroVideoReady) ? 'hidden' : 'visible', // Hide completely when preloader visible OR video not ready
            minHeight: '100%' // Ensure it fills the section
          }}
        >
          
          {/* Content wrapper - with proper top margin for title */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-12 md:pb-16">
            {/* Land Development Structure Title - with more top margin */}
            <motion.div 
              className="text-center mb-8 md:mb-12 relative mt-8 md:mt-12"
              style={{
                opacity: 1, // Always visible
                y: 0, // No scroll-based transforms
              }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white font-primary">
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
                opacity: 1, // Always visible
                y: 0, // No scroll-based transforms
              }}
            >

              {/* Total Hectares - Featured */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl">
                  <div className="text-6xl md:text-7xl font-bold mb-4 text-gray-900">
                    <AnimatedCounter end={300} suffix="+" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    {locale === 'es' ? 'Hectáreas Totales' : locale === 'zh' ? '总公顷数' : locale === 'fr' ? 'Hectares Totaux' : 'Total Hectares'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {locale === 'es' ? 'Zona de Desarrollo Industrial y Marítimo' : locale === 'zh' ? '工业和海事开发区' : locale === 'fr' ? 'Zone de Développement Industriel et Maritime' : 'Industrial & Maritime Development Zone'}
                  </p>
                </div>
              </div>

            {/* Company/Area Breakdown - 3 Cards Layout: 1 top, 2 bottom */}
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {/* Top Row: Patagon Valley (centered) */}
              <div className="flex justify-center">
                <motion.div 
                  className="relative w-full max-w-md rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
                  style={{
                    opacity: 1, // Always visible
                    y: 0, // No scroll-based transforms
                    transition: 'none', // Disable all CSS transitions
                  }}
                  transition={{ duration: 0, ease: "linear" }}
                  whileHover={{}}
                  whileTap={{}}
                  animate={{}}
                  onClick={handlePatagonValleyClick}
                  onMouseEnter={() => {
                    setIsHovered1(true)
                    router.prefetch(`/${locale}/parque-tecnologico`)
                  }}
                  onMouseLeave={() => setIsHovered1(false)}
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
                  
                  {/* Content - Paragraph with hover interaction */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Patagon Valley Logo - Fades out on hover */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isHovered1 ? 0 : 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ pointerEvents: 'none' }}
                    >
                      <Image
                        src="/logos/patagon_white.png"
                        alt="Patagon Valley Logo"
                        width={160}
                        height={64}
                        className="object-contain"
                      />
                    </motion.div>
                    
                    {/* Paragraph - Fades in on hover */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isHovered1 ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col items-center justify-between px-4 py-6 md:py-8"
                      style={{ pointerEvents: isHovered1 ? 'auto' : 'none' }}
                    >
                      <p className="text-white text-base md:text-lg leading-relaxed flex-1 flex items-center">
                        {locale === 'es' 
                          ? 'Hub de innovación y conectividad, con terrenos destinados a empresas intensivas en energía, telecomunicaciones, data, tecnología satelital y logística avanzada.'
                          : locale === 'zh'
                          ? '创新和连接中心，为能源、电信、数据、卫星技术和先进物流密集型公司提供土地。'
                          : locale === 'fr'
                          ? 'Hub d\'innovation et de connectivité, avec des terrains destinés aux entreprises intensives en énergie, télécommunications, données, technologie satellitaire et logistique avancée.'
                          : 'Innovation and connectivity hub, with land for companies intensive in energy, telecommunications, data, satellite technology, and advanced logistics.'}
                      </p>
                      <div className="text-gray-400 text-sm md:text-base font-medium mt-auto">
                        {locale === 'es' ? 'Ver más' : locale === 'zh' ? '查看更多' : locale === 'fr' ? 'Voir plus' : 'See more'}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row: Terminal Marítimo and Cabo Negro Dos (2 cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                {/* Terminal Marítimo */}
                <motion.div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
                  style={{
                    opacity: 1, // Always visible
                    y: 0, // No scroll-based transforms
                    transition: 'none', // Disable all CSS transitions
                  }}
                  transition={{ duration: 0, ease: "linear" }}
                  whileHover={{}}
                  whileTap={{}}
                  animate={{}}
                  onClick={handlePortZoneClick}
                  onMouseEnter={() => {
                    setIsHovered2(true)
                    router.prefetch(`/${locale}/terminal-maritimo`)
                  }}
                  onMouseLeave={() => setIsHovered2(false)}
                >
                  {/* Background Image - Default (shows when not hovered) */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isHovered2 ? 0 : 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Image
                      src="/terminal_maritimo_thumbnail.webp"
                      alt="Terminal Marítimo"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </motion.div>
                  {/* Background Image - Hover (shows when hovered) */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isHovered2 ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Image
                      src="/image16.webp"
                      alt="Terminal Marítimo"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </motion.div>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content - Paragraph with hover interaction */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Paragraph - Fades in on hover */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isHovered2 ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col items-center justify-between px-4 py-6 md:py-8"
                      style={{ pointerEvents: isHovered2 ? 'auto' : 'none' }}
                    >
                      <p className="text-white text-base md:text-lg leading-relaxed flex-1 flex items-center">
                        {locale === 'es'
                          ? 'Nuevo Puerto protegido y multipropósito diseñado para la creciente demanda logística, industrial y energética. Desarrollado junto a COMPAS marine'
                          : locale === 'zh'
                          ? '新的受保护多用途港口，旨在满足不断增长的物流、工业和能源需求。与COMPAS marine共同开发'
                          : locale === 'fr'
                          ? 'Nouveau port protégé et polyvalent conçu pour la demande croissante en logistique, industrie et énergie. Développé avec COMPAS marine'
                          : 'New protected and multipurpose port designed for the growing logistical, industrial, and energy demand. Developed with COMPAS marine'}
                      </p>
                      <div className="text-gray-400 text-sm md:text-base font-medium mt-auto">
                        {locale === 'es' ? 'Ver más' : locale === 'zh' ? '查看更多' : locale === 'fr' ? 'Voir plus' : 'See more'}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Cabo Negro Dos */}
                <motion.div 
                  className="relative rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
                  style={{
                    opacity: 1, // Always visible
                    y: 0, // No scroll-based transforms
                    transition: 'none', // Disable all CSS transitions
                  }}
                  transition={{ duration: 0, ease: "linear" }}
                  whileHover={{}}
                  whileTap={{}}
                  animate={{}}
                  onClick={handleCaboNegroDosClick}
                  onMouseEnter={() => {
                    setIsHovered3(true)
                    router.prefetch(`/${locale}/parque-logistico`)
                  }}
                  onMouseLeave={() => setIsHovered3(false)}
                >
                  {/* Background Image - Default (shows when not hovered) */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isHovered3 ? 0 : 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Image
                      src="/macrolote2_thumbnail.webp"
                      alt="Cabo Negro Dos"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </motion.div>
                  {/* Background Image - Hover (shows when hovered) */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: isHovered3 ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Image
                      src="/image15.webp"
                      alt="Cabo Negro Dos"
                      fill
                      className="object-cover"
                      style={{ objectPosition: 'center' }}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 512px"
                      priority={false}
                    />
                  </motion.div>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Content - Paragraph with hover interaction */}
                  <div className="relative p-6 md:p-8 min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center text-center">
                    {/* Paragraph - Fades in on hover */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isHovered3 ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col items-center justify-between px-4 py-6 md:py-8"
                      style={{ pointerEvents: isHovered3 ? 'auto' : 'none' }}
                    >
                      <p className="text-white text-base md:text-lg leading-relaxed flex-1 flex items-center">
                        {locale === 'es'
                          ? 'Terreno conectado al Estrecho de Magallanes y a Ruta Internacional. Su escala lo hace ideal para macro desarrollos logísticos, industriales, energéticos o de almacenamiento.'
                          : locale === 'zh'
                          ? '连接麦哲伦海峡和国际路线的土地。其规模使其成为物流、工业、能源或存储大型开发的理想选择。'
                          : locale === 'fr'
                          ? 'Terrain connecté au détroit de Magellan et à la route internationale. Son échelle le rend idéal pour les macro-développements logistiques, industriels, énergétiques ou de stockage.'
                          : 'Land connected to the Strait of Magellan and International Route. Its scale makes it ideal for macro logistical, industrial, energy, or storage developments.'}
                      </p>
                      <div className="text-gray-400 text-sm md:text-base font-medium mt-auto">
                        {locale === 'es' ? 'Ver más' : locale === 'zh' ? '查看更多' : locale === 'fr' ? 'Voir plus' : 'See more'}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Background image layer - fills entire section including border */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/cabonegro_wirefram2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: (isPreloaderBVisible || !heroVideoReady) ? 0 : 1, // Always visible when preloader hidden and video ready
            scale: 1, // No scroll-based zoom
            zIndex: 0, // Behind content
            display: (isPreloaderBVisible || !heroVideoReady) ? 'none' : 'block', // Hide completely when preloader is visible OR video not ready
            visibility: (isPreloaderBVisible || !heroVideoReady) ? 'hidden' : 'visible', // Double-check visibility
            pointerEvents: 'none', // Never block interactions
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Black overlay - fills entire section including border */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: 0.7, // Static opacity - no scroll-based changes
            zIndex: 0, // Behind content
            display: (isPreloaderBVisible || !heroVideoReady) ? 'none' : 'block',
            visibility: (isPreloaderBVisible || !heroVideoReady) ? 'hidden' : 'visible',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </motion.section>
    </>
  )
}