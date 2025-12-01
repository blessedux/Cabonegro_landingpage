import { WordRotate } from '@/components/ui/word-rotate'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionTemplate } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function HeroZh() {
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB } = usePreloader()

  // Single hero video (first video - logistics)
  const heroVideo = 'https://res.cloudinary.com/dezm9avsj/video/upload/v1763931613/cabonegro_pjk8im.mp4'
  
  // Extract locale from pathname
  const getLocale = () => {
    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0] || 'zh'
    return ['es', 'en', 'zh', 'fr'].includes(locale) ? locale : 'zh'
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
  const rotatingWords = ['物流', '港口', '科技']
  const subtitle = '麦哲伦海峡的综合基础设施，面向新能源和科技经济'
  const [displayWordIndex, setDisplayWordIndex] = useState(0)

  // Trigger hero animations immediately - no delay needed
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto-rotate word every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayWordIndex((prev) => (prev + 1) % rotatingWords.length)
    }, 4000) // 4 seconds

    return () => clearInterval(interval)
  }, [rotatingWords.length])

  // Handle "探索项目" button click - instant response
  const handleExploreProject = () => {
    setShowProjectOptions(true)
  }

  // Handle back button click - instant response
  const handleBack = () => {
    setShowProjectOptions(false)
  }

  // Handle project navigation - optimized for speed
  const handleProjectNavigation = (route: string) => {
    // No PreloaderB needed - project pages are fast, usePageTransition handles it
    // Navigate immediately without delay
    router.push(`/${currentLocale}${route}`)
  }

  return (
    <>
    <section 
      ref={heroRef}
      className="fixed top-0 left-0 right-0 h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden touch-pan-y z-[1]"
      style={{
        backgroundColor: 'transparent',
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
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // Force GPU acceleration
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
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
            <span>通往世界南方的</span>
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
    </section>
    </>
  )
}
