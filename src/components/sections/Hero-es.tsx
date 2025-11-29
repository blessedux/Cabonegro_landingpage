import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { WordRotate } from '@/components/ui/word-rotate'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function HeroEs() {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB } = usePreloader()
  
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
  }, [])

  // Handle video loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setBackgroundLoaded(true)
      })
    }
  }, [])

  const rotatingWords = ['portuaria', 'Tecnológica', 'logística']
  const subtitle = 'infraestructura integrada en el estrecho de magallanes para la nueva economía energética y tecnológica'

  // Handle "Explorar Proyecto" button click
  const handleExploreProject = () => {
    setShowProjectOptions(true)
  }

  // Handle back button click
  const handleBack = () => {
    setShowProjectOptions(false)
  }

  // Handle project navigation
  const handleProjectNavigation = (route: string) => {
    showPreloaderB()
    setTimeout(() => {
      router.push(`/${currentLocale}${route}`)
    }, 100)
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
      {/* Background Video - stays visible until Stats background covers it */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            opacity: 1,
            filter: 'brightness(1) contrast(1) saturate(1)',
            mixBlendMode: 'normal',
            zIndex: 0,
            willChange: 'auto'
          }}
        >
          <source 
            src="https://res.cloudinary.com/dezm9avsj/video/upload/v1763931613/cabonegro_pjk8im.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Hero Content - fades out on scroll */}
      <motion.div 
        className="container mx-auto relative z-[30] flex justify-start"
        initial={{ opacity: 1 }}
        style={{ 
          opacity: heroContentOpacity,
          y: heroContentY,
          pointerEvents: shouldBlockPointer ? 'auto' : 'none',
          willChange: 'opacity, transform'
        }}
      >
        <div 
          className="max-w-4xl w-full px-6 lg:px-12 relative z-[30] text-white" 
          style={{ 
            pointerEvents: 'auto',
            filter: 'brightness(1)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {/* Title and Subtitle - always visible */}
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
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              ease: "easeOut" 
            }}
          >
            <span className="flex items-center gap-2">
              <span>Plataforma</span>
              <WordRotate
                words={rotatingWords}
                duration={2500}
                className="font-bold text-white"
                framerProps={{
                  initial: { opacity: 0, y: -50 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 50 },
                  transition: { duration: 0.25, ease: "easeOut" },
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
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0,
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
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.5,
                  delay: 1.8,
                  ease: "easeOut" 
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="uppercase border-white text-white bg-transparent hover:bg-white hover:text-black select-none relative z-[50] cursor-pointer"
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
                transition={{ duration: 0.5, ease: "easeOut" }}
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
        </div>
      </motion.div>
    </section>
    </>
  )
}
