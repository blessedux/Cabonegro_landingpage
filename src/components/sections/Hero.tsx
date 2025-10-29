import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Trigger hero animations after preloader fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200) // Small delay to ensure smooth transition from preloader
    
    return () => clearTimeout(timer)
  }, [])

  const handleExploreTerrain = () => {
    startFadeOut()
    showPreloaderB()
    
    // Navigate to explore route after animations
    setTimeout(() => {
      router.push('/explore')
    }, 1000)
  }

  const handleDeckClick = () => {
    showPreloaderB()
    setTimeout(() => {
      router.push('/deck')
    }, 100)
  }

  // Removed performance monitoring and console logging

  // Removed hover handlers - keeping only click interactions for Spline scenes

  const handleClick = (event: React.MouseEvent) => {
    // Click handler for future interactive features
    // Currently just tracks click coordinates for potential use
  }

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden" style={{ touchAction: 'pan-y' }}>
      {/* Background Spline Scene - Glowing Planet Particles */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden"
        onClick={handleClick}
      >
        <iframe 
          src='https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          onLoad={() => {
            setBackgroundLoaded(true)
          }}
          style={{ 
            border: 'none',
            background: 'transparent',
            transform: 'scale(1.3)',
            transformOrigin: 'center center',
            pointerEvents: 'auto' // Enable pointer events for interaction
          }}
        />
      </div>

      {/* Subtle gradient overlay for better text readability - positioned to not block interactions */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-2 pointer-events-none" />
      

      <div className="container mx-auto relative z-10 flex justify-start pointer-events-none">
        <div className="max-w-4xl w-full px-6 lg:px-12 pointer-events-auto">
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
              text="Gateway to the South of the World"
              fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              textColor="text-white"
              animationDelay={0} // Start immediately with the h1 fade-in
            />
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl leading-relaxed text-left select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0, // Start after h1 completes (0.2s + 0.8s)
              ease: "easeOut" 
            }}
          >
            Cabo Negro is a Strategic Industrial & Maritime Hub <br></br>of the Southern Hemisphere.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-start items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.0, // Same delay as subtitle - they appear together
              ease: "easeOut" 
            }}
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-white text-white hover:bg-white hover:text-black select-none"
              onClick={handleExploreTerrain}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            >
              Explore Terrain
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="uppercase border-white text-white hover:bg-white hover:text-black select-none"
              onClick={handleDeckClick}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            >
              View Deck
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
