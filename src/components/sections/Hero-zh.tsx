import { Button } from '@/components/ui/button'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import Image from 'next/image'

export default function HeroZh() {
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB, isPreloaderComplete, setVideoReady } = usePreloader()

  // Single hero video (first video - logistics)
  const heroVideo = 'https://storage.reimage.dev/mente-files/vid-86ef632d3d23/original.mp4'
  
  // Extract locale from pathname
  const getLocale = () => {
    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0] || 'zh'
    return ['es', 'en', 'zh', 'fr'].includes(locale) ? locale : 'zh'
  }
  
  const currentLocale = getLocale()
  
  // Export scroll progress for use in other components (via context or prop)
  // For now, we'll use a shared scroll tracking approach
  
  // Words for typing animation
  const rotatingWords = ['物流', '港口', '科技']
  const subtitle = '麦哲伦海峡的综合基础设施，面向新能源和科技经济'

  // Trigger hero animations immediately when preloader completes - no delay
  useEffect(() => {
    // Set visible immediately if preloader is already complete (for return visits)
    // Or wait for preloader to complete (for first load)
    if (isPreloaderComplete) {
      setIsVisible(true)
    }
  }, [isPreloaderComplete])
  
  // Also check on mount if preloader is already complete
  useEffect(() => {
    if (isPreloaderComplete && !isVisible) {
      setIsVisible(true)
    }
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
        } catch (error) {
          // Silently handle autoplay errors (browser policies)
          setIsVideoPlaying(false)
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


  // Handle "探索项目" button click - instant response
  const handleExploreProject = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Use requestAnimationFrame to ensure state update happens immediately
    requestAnimationFrame(() => {
      setShowProjectOptions(true)
    })
  }

  // Handle back button click - instant response
  const handleBack = () => {
    setShowProjectOptions(false)
  }

  // Handle project navigation - show preloader for consistent transitions
  const handleProjectNavigation = (route: string) => {
    // CRITICAL: Show preloader INSTANTLY - use flushSync to force immediate state update
    flushSync(() => {
      showPreloaderB()
    })
    // Navigate IMMEDIATELY - no delays
    router.push(`/${currentLocale}${route}`)
  }

  return (
    <>
    <motion.section 
      ref={heroRef}
      className="relative w-full h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden touch-pan-y"
      style={{
        backgroundColor: '#FFFFFF', // White background
        height: '100vh',
        minHeight: '100vh',
        width: '100%',
        zIndex: 0, // Normal z-index for document flow (below navbar at 100) - set to 0 to ensure navbar is always above
        opacity: 1, // Keep Hero section always visible - video stays in place
        display: 'flex', // Ensure it's displayed
        visibility: 'visible', // Ensure Hero section is always visible
        // Removed isolation: 'isolate' to prevent stacking context issues with navbar
        pointerEvents: 'auto' // Always allow pointer events
      }}
    >
      {/* Background Video - static single video */}
      <div 
        className="absolute z-0 overflow-hidden rounded-lg" 
        style={{ 
          zIndex: 0, 
          pointerEvents: 'none',
          top: '0.5rem', // Small margin from top
          left: '0.5rem', // Small margin from left
          right: '0.5rem', // Small margin from right
          bottom: 0 // No margin from bottom
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {/* Placeholder image - always render, fade out smoothly when video is ready */}
          <Image
            src="/cabonegro_frame1.webp"
            alt="Cabo Negro Hero"
            fill
            priority
            fetchPriority="high"
            className="absolute inset-0 object-cover"
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            style={{
              zIndex: 1,
              // Keep placeholder visible until video is fully loaded and ready to play
              // Only fade out when video is loaded AND (not mobile OR video is playing)
              opacity: (shouldLoadVideo && videoLoaded && (!isMobile || isVideoPlaying)) ? 0 : 1,
              transition: 'opacity 0.8s ease-in-out',
              pointerEvents: 'none'
            }}
          />
          
          {/* Video element - always render when shouldLoadVideo is true to ensure smooth transition */}
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)', // Force GPU acceleration
                zIndex: 2, // Always above placeholder
                // Fade in video when it's loaded AND ready to play
                // On mobile, also wait for video to be playing
                opacity: (videoLoaded && (!isMobile || isVideoPlaying)) ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                backgroundColor: '#000000', // Black background while loading to prevent white flash
                minWidth: '100%',
                minHeight: '100%',
                width: '100%',
                height: '100%'
              }}
              onLoadedData={() => {
                if (videoRef.current && videoRef.current.readyState >= 3) {
                  setVideoLoaded(true)
                  setVideoReady(true)
                }
              }}
              onCanPlay={() => {
                setVideoLoaded(true)
                setVideoReady(true)
              }}
              onCanPlayThrough={() => {
                setVideoLoaded(true)
                setVideoReady(true)
              }}
              onLoadedMetadata={() => {
                if (videoRef.current && videoRef.current.readyState >= 3) {
                  setVideoReady(true)
                }
              }}
              onStalled={() => {
                // Video stalled - will resume automatically
              }}
              onWaiting={() => {
                // Video waiting for data - will resume automatically
              }}
              onError={(e) => {
                // Video error - set error state but don't block content
                setVideoError(true)
                // Still signal video ready to prevent blocking non-home pages
                setVideoReady(true)
              }}
              onLoadStart={() => {
                setVideoLoaded(false)
              }}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      {/* Hero Content - always visible, no scroll-based fade */}
      <motion.div 
        className="container mx-auto relative z-[30] flex justify-start"
        style={{ 
          opacity: 1, // Always visible - no scroll-based fade
          pointerEvents: 'auto', // Always allow pointer events - buttons should always be clickable
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
              textShadow: '0 0 0 rgba(255,255,255,1)'
            }}
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: 0,
              ease: "easeOut"
            }}
          >
            <span>通往世界南方的</span>
            <span>
              <TypingAnimation
                words={rotatingWords}
                duration={100}
                deleteSpeed={50}
                pauseTime={2000}
                className="font-bold text-white"
              />
            </span>
            <span>门户</span>
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
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{
              duration: 0.3,
              delay: 0.1, // Small delay after title
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
                className="flex flex-col sm:flex-row gap-4 justify-start items-start relative z-[20]"
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  delay: 0.2, // Small delay after subtitle
                  ease: "easeOut"
                }}
                style={{ 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 20 // Above hero content but below navbar (100)
                }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[20] cursor-pointer transition-all duration-200 touch-manipulation"
                  onClick={handleExploreProject}
                  onTouchEnd={handleExploreProject}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    pointerEvents: 'auto',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 20, // Above hero content but below navbar (100)
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: '44px',
                    minWidth: '44px',
                    cursor: 'pointer',
                  }}
                >
                  探索项目
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="project-buttons"
                className="flex flex-col md:flex-row gap-4 justify-start items-start relative z-[40]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
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
                    港口码头
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
                  科技园区
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
                  物流园区
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
    </>
  )
}
