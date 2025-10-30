import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HeroEs() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [variantIndex, setVariantIndex] = useState<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  
  // Trigger hero animations after preloader fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200) // Small delay to ensure smooth transition from preloader
    
    return () => clearTimeout(timer)
  }, [])

  const handleExploreTerrain = () => {
    // Show PreloaderB first BEFORE any other actions
    showPreloaderB()
    
    // Use requestAnimationFrame to ensure state update is processed
    requestAnimationFrame(() => {
      startFadeOut()
      
      // Navigate after PreloaderB has time to display (2.5 seconds)
      setTimeout(() => {
        router.push('/es/explore')
      }, 2500)
    })
  }

  const handleClick = (event: React.MouseEvent) => {
    // Click handler for future interactive features
    // Currently just tracks click coordinates for potential use
  }

  const variants = [
    {
      key: 'A',
      src: 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/',
      title: 'Puerta de Entrada al Sur del Mundo',
      subtitle: 'Cabo Negro es un Centro Industrial y Marítimo Estratégico del Hemisferio Sur.'
    },
    {
      key: 'B',
      src: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/',
      title: 'Puerta de Entrada al Sur del Mundo',
      subtitle: 'Cabo Negro es un Centro Industrial y Marítimo Estratégico del Hemisferio Sur.'
    },
    {
      key: 'C',
      src: 'https://my.spline.design/untitledcopy-hgQ9E6T0cuMuR3COTVFVso6a/',
      title: 'Puerta de Entrada al Sur del Mundo',
      subtitle: 'Cabo Negro es un Centro Industrial y Marítimo Estratégico del Hemisferio Sur.'
    }
  ]

  const current = variants[variantIndex]
  const nextVariant = () => setVariantIndex((i) => (i + 1) % variants.length)
  const prevVariant = () => setVariantIndex((i) => (i - 1 + variants.length) % variants.length)

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden" style={{ touchAction: 'pan-y' }}>
      {/* Background Spline Scene - variantes intercambiables */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden"
        onClick={handleClick}
      >
        <iframe 
          src={current.src}
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          title={`Escena de fondo ${current.key}`}
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
      

      {/* Conmutador por chevrones (3 variantes) */}
      <div className="absolute top-24 right-6 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-2 py-1 rounded-full border border-white/10">
          <button onClick={prevVariant} className="p-1.5 rounded-full hover:bg-white/10 text-white" aria-label="Fondo anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/80 px-2">{current.key}</span>
          <button onClick={nextVariant} className="p-1.5 rounded-full hover:bg-white/10 text-white" aria-label="Siguiente fondo">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
              text={current.title}
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
            {current.subtitle}
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
              Explorar Terreno
            </Button>
            <Link href="/es/deck">
              <Button 
                size="lg" 
                variant="outline" 
                className="uppercase border-white text-white hover:bg-white hover:text-black select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
              >
                Ver Deck
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
