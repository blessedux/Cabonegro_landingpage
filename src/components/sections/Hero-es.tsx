import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { WordRotate } from '@/components/ui/word-rotate'
import { HeroVideoSlider } from '@/components/ui/hero-video-slider'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionTemplate } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function HeroEs() {
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB } = usePreloader()

  // Video sources for the slider
  // Slide 0: logística, Slide 1: portuaria, Slide 2: Tecnológica
  const heroVideos = [
    'https://res.cloudinary.com/dezm9avsj/video/upload/v1763931613/cabonegro_pjk8im.mp4', // Slide 1: logística
    'https://res.cloudinary.com/dezm9avsj/video/upload/v1764433234/cabonegro_slide2_vktkza.mp4', // Slide 2: portuaria
    'https://res.cloudinary.com/dezm9avsj/video/upload/v1764433255/cabonegro_slide3_ngbqi0.mp4', // Slide 3: Tecnológica
  ]
  
  // Extract locale from pathname
  const getLocale = () => {
    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0] || 'es'
    return ['es', 'en', 'zh', 'fr'].includes(locale) ? locale : 'es'
  }
  
  const currentLocale = getLocale()
  
  // Track overall page scroll progress (not section-specific)
  // This ensures fade-out happens at the correct overall page scroll percentage
  const { scrollYProgress } = useScroll()

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
  
  // Trigger hero animations immediately - no delay needed
  useEffect(() => {
    setIsVisible(true)
    // Initialize display word index
    setDisplayWordIndex(0)
    // Mark slide as settled on initial load (no transition needed)
    setSlideSettled(true)
  }, [])

  // Words ordered to match video slides: logística (slide 0), portuaria (slide 1), Tecnológica (slide 2)
  const rotatingWords = ['logística', 'portuaria', 'Tecnológica']
  const subtitle = 'infraestructura integrada en el estrecho de magallanes para la nueva economía energética y tecnológica'
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [displayWordIndex, setDisplayWordIndex] = useState(0) // Word index to display (delayed)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [slideSettled, setSlideSettled] = useState(false) // Track when slide transition completes

  // Handle "Explorar Proyecto" button click - instant response
  const handleExploreProject = () => {
    setShowProjectOptions(true)
  }

  // Handle back button click - instant response
  const handleBack = () => {
    setShowProjectOptions(false)
  }

  // Handle project navigation - optimized for speed
  const handleProjectNavigation = (route: string) => {
    // Show preloader immediately
    showPreloaderB()
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
      {/* Background Video Slider - auto-slides when at top, stops when scrolled */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <motion.div
          style={{
            filter: blurFilter,
            willChange: 'filter',
            width: '100%',
            height: '100%'
          }}
        >
          <HeroVideoSlider
            videos={heroVideos}
            slideDuration={8000}
            className="w-full h-full"
            showDots={true}
            disableAutoSlide={showProjectOptions}
            onSlideChange={(index, direction) => {
              setCurrentSlideIndex(index)
              setSlideDirection(direction || 'left')
              // Reset slide settled state when slide changes
              setSlideSettled(false)
              // After slide transition completes (0.6s), mark as settled and update word
              setTimeout(() => {
                setSlideSettled(true)
                setDisplayWordIndex(index)
              }, 600) // Match the slide transition duration
            }}
          />
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

      {/* Hero Content - slides horizontally with videos and fades out on scroll */}
      <motion.div 
        className="container mx-auto relative z-[30] flex justify-start"
        style={{ 
          opacity: heroContentOpacity,
          y: heroContentY,
          pointerEvents: shouldBlockPointer ? 'auto' : 'none',
          willChange: 'opacity, transform'
        }}
      >
        <AnimatePresence mode="sync" custom={slideDirection}>
          <motion.div
            key={currentSlideIndex}
            custom={slideDirection}
            initial={{ x: slideDirection === 'left' ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection === 'left' ? '-100%' : '100%', opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.1, 0.25, 1] 
            }}
            className="max-w-4xl w-full px-6 lg:px-12 relative z-[30] text-white" 
            style={{ 
              pointerEvents: 'auto',
              filter: 'brightness(1)',
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
          {/* Title and Subtitle - fade in after slide settles */}
          <motion.h1 
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
            animate={slideSettled && isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.1,
              ease: "easeOut" 
            }}
          >
            <span className="flex items-center gap-2">
              <span>Plataforma</span>
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
            <span>del sur del mundo</span>
          </motion.h1>
          <motion.p 
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
            animate={slideSettled && isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                key="cta-button"
                className="flex flex-col sm:flex-row gap-4 justify-start items-start relative z-[40]"
                initial={{ opacity: 0, y: 20 }}
                animate={slideSettled && isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                  Explorar Proyecto
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="project-buttons"
                className="flex flex-row gap-4 justify-start items-center relative z-[40]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ pointerEvents: 'auto' }}
              >
                {/* Back Button */}
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
                {/* Three Project Buttons */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer"
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
                  Terminal Marítimo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer"
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
                  Parque Tecnológico
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer"
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
                  Parque Logístico
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
    </>
  )
}
