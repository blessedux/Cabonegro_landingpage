import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress from the start of the page
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  // Hero content fades out as user scrolls (starts fading at 0.2, fully faded at 0.6)
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.6], [1, 1, 0])
  const heroContentY = useTransform(scrollYProgress, [0, 0.2, 0.6], [0, 0, -30])
  
  // Video stays visible - no fade out. Stats background will cover it as it fades in
  
  // Export scroll progress for use in other components (via context or prop)
  // For now, we'll use a shared scroll tracking approach
  
  // Trigger hero animations after preloader fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200) // Small delay to ensure smooth transition from preloader
    
    return () => clearTimeout(timer)
  }, [])

  // Handle video loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setBackgroundLoaded(true)
      })
    }
  }, [])

  const handleExploreTerrain = () => {
    // Show PreloaderB first BEFORE any other actions
    showPreloaderB()
    
    // Use requestAnimationFrame to ensure state update is processed
    requestAnimationFrame(() => {
      startFadeOut()
      
      // Navigate after PreloaderB has time to display (2.5 seconds)
      setTimeout(() => {
        router.push('/explore')
      }, 2500)
    })
  }

  const handleDeckClick = () => {
    showPreloaderB()
    setTimeout(() => {
      router.push('/deck')
    }, 100)
  }

  const title = 'Gateway to the South of the World'
  const subtitle = 'Cabo Negro is a Strategic Industrial & Maritime Hub of the Southern Hemisphere.'

  return (
    <section 
      ref={heroRef}
      className="fixed top-0 left-0 right-0 h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden touch-pan-y z-[5]"
      style={{
        backgroundColor: 'transparent',
        pointerEvents: 'auto'
      }}
    >
      {/* Background Video - stays visible until Stats background covers it */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            opacity: 1,
            filter: 'brightness(1) contrast(1)',
            mixBlendMode: 'normal'
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
        style={{ 
          opacity: heroContentOpacity,
          y: heroContentY,
          pointerEvents: 'auto',
          willChange: 'opacity, transform'
        }}
      >
        <div className="max-w-4xl w-full px-6 lg:px-12 relative z-[30]" style={{ pointerEvents: 'auto' }}>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-left select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2, // Start immediately after preloader fade
              ease: "easeOut" 
            }}
          >
            <BlurTextAnimation 
              text={title}
              fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              textColor="text-white"
              animationDelay={0} // Start immediately with the h1 fade-in
            />
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-2xl leading-relaxed text-left select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0, // Start after h1 completes (0.2s + 0.8s)
              ease: "easeOut" 
            }}
          >
            {subtitle}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-start items-start relative z-[40]"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0, // Same delay as subtitle - they appear together
              ease: "easeOut" 
            }}
            style={{ pointerEvents: 'auto' }}
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-accent text-accent hover:bg-accent hover:text-white select-none relative z-[50] cursor-pointer"
              onClick={handleExploreTerrain}
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
              Explore Terrain
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-accent text-accent hover:bg-accent hover:text-white select-none relative z-[50] cursor-pointer"
              onClick={handleDeckClick}
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
              View Deck
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
