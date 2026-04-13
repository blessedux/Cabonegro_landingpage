import { Button } from '@/components/ui/button'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import Image from 'next/image'

export default function HeroFr() {
  const [isVisible, setIsVisible] = useState(false)
  const [showProjectOptions, setShowProjectOptions] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { push } = useNavigateWithPreloader()
  const { isPreloaderComplete } = usePreloader()
  
  // Extract locale from pathname
  const getLocale = () => {
    const segments = pathname.split('/').filter(Boolean)
    const locale = segments[0] || 'fr'
    return ['es', 'en', 'zh', 'fr'].includes(locale) ? locale : 'fr'
  }
  
  const currentLocale = getLocale()
  
  // Export scroll progress for use in other components (via context or prop)
  // For now, we'll use a shared scroll tracking approach
  
  // Words for typing animation
  const rotatingWords = ['logistique', 'portuaire', 'Technologique']
  const subtitle = 'infrastructure intégrée dans le détroit de Magellan pour la nouvelle économie énergétique et technologique'

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

  // Handle "Explorer Projet" button click - instant response
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
    push(`/${currentLocale}${route}`)
  }

  return (
    <>
    <motion.section 
      ref={heroRef}
      className="relative w-full h-[90vh] pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden touch-pan-y"
      style={{
        backgroundColor: '#FFFFFF', // White background
        height: '90vh',
        minHeight: '90vh',
        width: '100%',
        zIndex: 0, // Normal z-index for document flow (below navbar at 100) - set to 0 to ensure navbar is always above
        opacity: 1, // Keep Hero section always visible - video stays in place
        display: 'flex', // Ensure it's displayed
        visibility: 'visible', // Ensure Hero section is always visible
        // Removed isolation: 'isolate' to prevent stacking context issues with navbar
        pointerEvents: 'auto' // Always allow pointer events
      }}
    >
      {/* Static background image for fast initial load */}
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
              pointerEvents: 'none'
            }}
          />
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
        <div className="max-w-4xl w-full px-6 lg:px-12 relative z-[30] text-white flex flex-col h-full" 
          style={{ 
            pointerEvents: 'auto',
            filter: 'brightness(1)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            // h1 will be centered, subtitle/buttons container uses mt-auto to push to bottom
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
            <span>Plateforme</span>
            <span>
              <TypingAnimation
                words={rotatingWords}
                duration={100}
                deleteSpeed={50}
                pauseTime={2000}
                className="font-bold text-white"
              />
            </span>
            <span>du sud du monde</span>
          </motion.h1>
          {/* Subtitle and Buttons Container - positioned at bottom */}
          <div style={{ marginTop: 'auto', paddingBottom: '3rem' }}>
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
                  Explorer Projet
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
                    Terminal Maritime
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
                  Parc Technologique
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
                  Parc Logistique
                </Button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.section>
    </>
  )
}

