import { Button } from '@/components/ui/button'
import { WordRotate } from '@/components/ui/word-rotate'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef, startTransition } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionTemplate } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import Image from 'next/image'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB, isPreloaderComplete } = usePreloader()

  // Single hero video (first video - logistics)
  const heroVideo = 'https://res.cloudinary.com/dezm9avsj/video/upload/v1763931613/cabonegro_pjk8im.mp4'
  
  // Extract locale from pathname
  const getLocale = () => {
    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0] || 'en'
    return ['es', 'en', 'zh', 'fr'].includes(locale) ? locale : 'en'
  }
  
  const currentLocale = getLocale()
  
  // Track overall page scroll progress (not section-specific)
  // This ensures fade-out happens at the correct overall page scroll percentage
  // Use heroRef as target to prevent hydration issues during language switching
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Hero content stays visible until AboutUs starts appearing
  // Fade out smoothly as user scrolls - starts fading earlier for smoother transition
  // Fades out from 0% to 5% of overall page scroll to fade out earlier
  // Ensure it starts at opacity 1 (visible) on initial load
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0, 0.05], [1, 1, 0], { clamp: true })
  const heroContentY = useTransform(scrollYProgress, [0, 0, 0.05], [0, 0, -30], { clamp: true })
  
  // Background blur and overlay effects - fade in as AboutUs comes into view
  // Start fading in slightly before hero content fades out (at 2% scroll) and reach full effect at 8% scroll
  // This creates a smooth transition where background gets darker/blurred as AboutUs text appears
  // Blur: 0px to 3px (subtle blur, a couple of points)
  // Overlay: 0% to 10% opacity black
  const backgroundBlur = useTransform(scrollYProgress, [0.02, 0.08], [0, 3], { clamp: true })
  const overlayOpacity = useTransform(scrollYProgress, [0.02, 0.08], [0, 0.1], { clamp: true })
  
  // Create a template for the blur filter using the MotionValue
  const blurFilter = useMotionTemplate`blur(${backgroundBlur}px)`
  
  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(true)
  
  useMotionValueEvent(heroContentOpacity, "change", (latest) => {
    // Only enable pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })
  
  // Video stays visible - no fade out. Stats background will cover it as it fades in
  
  // Export scroll progress for use in other components (via context or prop)
  // For now, we'll use a shared scroll tracking approach
  
  // Words for rotating animation
  const rotatingWords = ['Logistical', 'Maritime', 'Technological']
  const subtitle = 'integrated infrastructure in the Strait of Magellan for the new energy and technological economy'
  const [displayWordIndex, setDisplayWordIndex] = useState(0)

  // Trigger hero animations immediately - no delay needed
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Track video loading state
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [videoInViewport, setVideoInViewport] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                              (window.innerWidth <= 768)
        setIsMobile(isMobileDevice)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Lazy load video using Intersection Observer - only load when hero is in viewport
  useEffect(() => {
    if (!heroRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVideoInViewport(true)
            // Load video after a short delay to ensure page is interactive
            setTimeout(() => {
              setShouldLoadVideo(true)
            }, 500)
          }
        })
      },
      {
        rootMargin: '50px', // Start loading slightly before it's fully visible
        threshold: 0.1
      }
    )

    observer.observe(heroRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Programmatically play video on mobile after user interaction
  // iOS Safari requires user interaction before videos can autoplay
  useEffect(() => {
    if (!shouldLoadVideo) return

    const playVideo = async () => {
      if (videoRef.current) {
        try {
          // Ensure video is muted and has playsInline for mobile
          videoRef.current.muted = true
          await videoRef.current.play()
          setIsVideoPlaying(true)
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Video started playing')
          }
        } catch (error) {
          // Silently handle autoplay errors (browser policies)
          // Video will still show first frame
          setIsVideoPlaying(false)
          if (process.env.NODE_ENV === 'development') {
            console.warn('Video autoplay error:', error)
          }
        }
      }
    }

    // Try to play after preloader completes (user interaction)
    if (isPreloaderComplete) {
      // Small delay to ensure video element is ready
      setTimeout(playVideo, 100)
    }

    // Also try on first user interaction (touch/scroll) as fallback
    const handleUserInteraction = () => {
      playVideo()
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction, true)
    }

    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true })
    document.addEventListener('scroll', handleUserInteraction, { once: true, passive: true })

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction, true)
    }
  }, [isPreloaderComplete, shouldLoadVideo])
  
  // Monitor video playing state
  useEffect(() => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    
    const handlePlay = () => {
      setIsVideoPlaying(true)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Video play event fired')
      }
    }
    
    const handlePause = () => {
      setIsVideoPlaying(false)
    }
    
    const handlePlaying = () => {
      setIsVideoPlaying(true)
    }
    
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('playing', handlePlaying)
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('playing', handlePlaying)
    }
  }, [shouldLoadVideo])

  // Auto-rotate word every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 4000) // 4 seconds

    return () => clearInterval(interval)
  }, [rotatingWords.length])

  // Handle "Explore Project" button click - instant response
  const handleExploreProject = () => {
    setShowProjectOptions(true)
  }

  // Handle back button click - instant response
  const handleBack = () => {
    setShowProjectOptions(false)
  }

  // Handle project navigation - show preloader for consistent transitions
  const handleProjectNavigation = (route: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Hero: handleProjectNavigation - showing preloader before navigation', { route })
    }
    // Show preloader immediately before navigation for consistent UX
    // This must happen synchronously before router.push to prevent white screen
    showPreloaderB()
    // Navigate immediately without delay
    startTransition(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Hero: Navigating to', `/${currentLocale}${route}`)
      }
      router.push(`/${currentLocale}${route}`)
    })
  }

  return (
    <>
    <section 
      ref={heroRef}
      className="fixed top-0 left-0 right-0 h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden touch-pan-y z-[1]"
      style={{
        backgroundColor: videoLoaded ? 'transparent' : '#000000', // Black background while video loads
        pointerEvents: 'auto',
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        zIndex: 1,
        opacity: 1, // Ensure section itself is always visible
        visibility: 'visible', // Force visibility
        display: 'flex' // Ensure it's displayed
      }}
    >
      {/* Background Video - static single video */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <motion.div
          style={{
            filter: blurFilter,
            willChange: 'filter',
            width: '100%',
            height: '100%'
          }}
        >
          {shouldLoadVideo && (!isMobile || isVideoPlaying) ? (
            // Show video element only if: (1) video should load AND (2) either not mobile OR video is playing
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)', // Force GPU acceleration
                backgroundColor: videoLoaded ? 'transparent' : '#000000', // Black background while loading
              }}
              onLoadedData={() => {
                setVideoLoaded(true)
              }}
              onCanPlay={() => {
                setVideoLoaded(true)
              }}
              onError={(e) => {
                if (process.env.NODE_ENV === 'development') {
                  console.error('Video loading error:', e)
                }
                setVideoError(true)
              }}
              onLoadStart={() => {
                setVideoLoaded(false)
              }}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          ) : (
            // Show poster image: (1) while video is not loaded, OR (2) on mobile when video isn't playing
            // Optimized with Next.js Image component for better performance
            <Image
              src="/cabonegro_frame1.webp"
              alt="Cabo Negro Hero"
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="100vw"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          )}
        </motion.div>
        {/* Dark overlay that fades in as AboutUs comes into view */}
        <motion.div
          className="absolute inset-0 bg-black"
          style={{
            opacity: overlayOpacity,
            zIndex: 1,
            pointerEvents: 'none',
            willChange: 'opacity'
          }}
        />
      </div>

      {/* Hero Content - fades out on scroll */}
      <motion.div 
        className="container mx-auto relative z-[30] flex justify-start"
        style={{ 
          opacity: heroContentOpacity,
          y: heroContentY,
          pointerEvents: shouldBlockPointer ? 'auto' : 'none',
          willChange: 'opacity, transform'
        }}
      >
        <div className="max-w-4xl w-full px-6 lg:px-12 relative z-[30] text-white" 
          style={{ 
            pointerEvents: 'auto',
            filter: 'brightness(1)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {/* Title and Subtitle */}
          <motion.h1 
            ref={h1Ref}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-left select-none text-white flex flex-col font-primary"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              MozUserSelect: 'none', 
              msUserSelect: 'none',
              color: '#ffffff',
              textShadow: '0 0 0 rgba(255,255,255,1)',
              fontFamily: "'PP Neue Montreal', sans-serif"
            }}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.1,
              ease: "easeOut" 
            }}
          >
            <span>
              <WordRotate
                words={rotatingWords}
                controlledIndex={displayWordIndex}
                className="font-bold text-white"
                framerProps={{
                  initial: { opacity: 0, y: -50 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 50 },
                  transition: { duration: 0.6, ease: "easeOut" },
                }}
              />
            </span>
            <span>platform</span>
            <span>of the south of the world</span>
          </motion.h1>
          <motion.p 
            ref={paragraphRef}
            className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-2xl leading-relaxed text-left select-none italic"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              MozUserSelect: 'none', 
              msUserSelect: 'none',
              color: '#ffffff',
              textShadow: '0 0 0 rgba(255,255,255,1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.4, // Fade in after H1 starts appearing
              ease: "easeOut" 
            }}
          >
            {subtitle}
          </motion.p>

          {/* Button Section - switches between single CTA and three project buttons */}
          <AnimatePresence mode="wait">
            {!showProjectOptions ? (
              <motion.div 
                ref={ctaRef}
                key="cta-button"
                className="flex flex-col sm:flex-row gap-4 justify-start items-start relative z-[40]"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.7, // Fade in after subtitle
                  ease: "easeOut" 
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer transition-all duration-200"
                  onClick={handleExploreProject}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    pointerEvents: 'auto',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 50
                  }}
                >
                  Explore Project
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="project-buttons"
                className="flex flex-col md:flex-row gap-4 justify-start items-start relative z-[40]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ pointerEvents: 'auto' }}
              >
                {/* First Row: Back Button + First Project Button */}
                <div className="flex flex-row gap-4 items-center">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer"
                    onClick={handleBack}
                    style={{ 
                      userSelect: 'none', 
                      WebkitUserSelect: 'none', 
                      MozUserSelect: 'none', 
                      msUserSelect: 'none',
                      pointerEvents: 'auto',
                      opacity: 1,
                      position: 'relative',
                      zIndex: 50,
                      minWidth: 'auto',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer text-sm md:text-base"
                    onClick={() => handleProjectNavigation('/terminal-maritimo')}
                    style={{ 
                      userSelect: 'none', 
                      WebkitUserSelect: 'none', 
                      MozUserSelect: 'none', 
                      msUserSelect: 'none',
                      pointerEvents: 'auto',
                      opacity: 1,
                      position: 'relative',
                      zIndex: 50
                    }}
                  >
                    Maritime Terminal
                  </Button>
                </div>
                {/* Second Row: Second Project Button */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer text-sm md:text-base"
                  onClick={() => handleProjectNavigation('/parque-tecnologico')}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    pointerEvents: 'auto',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 50
                  }}
                >
                  Technology Park
                </Button>
                {/* Third Row: Third Project Button */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer text-sm md:text-base"
                  onClick={() => handleProjectNavigation('/parque-logistico')}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    pointerEvents: 'auto',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 50
                  }}
                >
                  Logistics Park
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
    </>
  )
}
