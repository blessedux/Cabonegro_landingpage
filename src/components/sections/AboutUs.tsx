'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { usePathname } from 'next/navigation'
import RotatingEarth from '@/components/ui/rotating-earth'

interface TextSection {
  label: string
  title: string
  description: string
}

// AnimatedWord component for word-by-word fill-in animation
function AnimatedWord({ 
  word, 
  index, 
  totalWords, 
  scrollProgress 
}: { 
  word: string
  index: number
  totalWords: number
  scrollProgress: number
}) {
  // Each word animates quickly - complete by 0.08 of scroll progress (well before icon transition at 0.167)
  // Words spread over first 8% of section scroll
  const animationRange = 0.08;
  const start = (index / totalWords) * animationRange;
  const end = start + (1 / totalWords) * animationRange;
  
  // Calculate opacity based on scroll progress
  let opacity = 0;
  if (scrollProgress >= end) {
    opacity = 1;
  } else if (scrollProgress >= start) {
    opacity = (scrollProgress - start) / (end - start);
  }

  return (
    <span className="relative mr-1 inline-block">
      <span className="absolute opacity-20">{word}</span>
      <span style={{ opacity: Math.max(0, Math.min(1, opacity)) }}>{word}</span>
    </span>
  );
}

// Paragraph wrapper with scroll-based word animation
function AnimatedParagraph({ text, scrollProgress, className = "" }: { text: string; scrollProgress: number; className?: string }) {
  const words = text.split(" ");

  return (
    <p className={`flex flex-wrap leading-[2] text-lg sm:text-xl ${className}`} style={{ color: '#ffffff' }}>
      {words.map((word, i) => (
        <AnimatedWord 
          key={i}
          word={word}
          index={i}
          totalWords={words.length}
          scrollProgress={scrollProgress}
        />
      ))}
    </p>
  );
}

export default function AboutUs() {
  const pathname = usePathname()
  
  // Determine locale from pathname
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const aboutTitle = locale === 'es' ? 'Cabo Negro: Una localización estratégica' : locale === 'zh' ? '卡波内格罗海事码头' : locale === 'fr' ? 'Terminal Maritime Cabo Negro' : 'Cabo Negro Maritime Terminal'
  
  // Intro paragraph text
  const introParagraph = locale === 'es' 
    ? 'Chile es el país más austral del mundo. En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur. El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    : locale === 'zh'
    ? '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
    : locale === 'fr'
    ? 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
    : 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'
  
  // Define icon sections based on locale (these will be displayed as a list, not scrolling)
  const textSections: TextSection[] = locale === 'es' ? [
    {
      label: 'Ubicación Estratégica',
      title: 'Chile es el país más austral del mundo',
      description: 'En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur.'
    },
    {
      label: 'Desarrollo Portuario',
      title: 'Cabo Negro: Nodo clave para Magallanes',
      description: 'El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    },
    {
      label: 'Hidrógeno Verde',
      title: 'Potencial eólico excepcional',
      description: 'Magallanes posee uno de los mayores potenciales eólicos del planeta, ideal para la producción de hidrógeno verde y energías renovables.'
    },
    {
      label: 'Ruta Alternativa',
      title: 'Paso natural libre de peajes',
      description: 'Ruta alternativa al Canal de Panamá, paso natural libre de peajes y confiable ante restricciones globales.'
    }
  ] : locale === 'zh' ? [
    {
      label: 'Strategic Location',
      title: '智利最南端的远见性发展',
      description: '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
    },
    {
      label: 'Green Hydrogen',
      title: '绿色氢经济',
      description: '作为智利绿色氢经济的战略门户，卡波内格罗将推动可再生能源的发展。'
    },
    {
      label: 'Trade Routes',
      title: '国际贸易路线',
      description: '作为国际贸易路线的战略门户，连接全球市场。'
    },
    {
      label: 'Maritime Terminal',
      title: '海事码头',
      description: '现代化的海事码头设施，支持高效的物流和运输。'
    }
  ] : locale === 'fr' ? [
    {
      label: 'Emplacement Stratégique',
      title: 'Développement visionnaire',
      description: 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
    },
    {
      label: 'Hydrogène Vert',
      title: 'Économie de l\'hydrogène vert',
      description: 'Porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili.'
    },
    {
      label: 'Routes Commerciales',
      title: 'Routes commerciales internationales',
      description: 'Connecter les marchés mondiaux à travers des routes commerciales stratégiques.'
    },
    {
      label: 'Terminal Maritime',
      title: 'Installations modernes',
      description: 'Terminal maritime moderne avec des installations de logistique et de transport efficaces.'
    }
  ] : [
    {
      label: 'Strategic Location',
      title: 'Cabo Negro Maritime Terminal',
      description: 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'
    },
    {
      label: 'Green Hydrogen',
      title: 'Gateway to Green Hydrogen Economy',
      description: 'Positioned as the strategic gateway for Chile\'s green hydrogen economy, Cabo Negro will drive renewable energy development.'
    },
    {
      label: 'Trade Routes',
      title: 'International Trade Routes',
      description: 'Serving as a strategic gateway for international trade routes, connecting global markets.'
    },
    {
      label: 'Maritime Terminal',
      title: 'Modern Maritime Facilities',
      description: 'State-of-the-art maritime terminal facilities supporting efficient logistics and transportation.'
    }
  ]

  const containerRef = useRef<HTMLElement>(null)
  const stickyContainerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  // Remap value from one range to another (similar to reference code)
  const remapValue = (value: number, start1: number, end1: number, start2: number, end2: number): number => {
    const remapped = (value - start1) * (end2 - start2) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }
  
  // Handle scroll - similar to reference code pattern
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    
    const viewportTop = window.scrollY
    const container = containerRef.current
    const containerHeight = container.clientHeight
    const containerTop = container.offsetTop
    const containerBottom = containerTop + containerHeight
    
    let scrollValue = 0
    
    if (containerBottom <= viewportTop) {
      // Container bottom is above viewport
      scrollValue = 1
    } else if (containerTop >= viewportTop) {
      // Container top is below viewport
      scrollValue = 0
    } else {
      // Container intersects with viewport - remap scroll position to 0-1
      scrollValue = remapValue(viewportTop, containerTop, containerBottom, 0, 1)
    }
    
    setScrollProgress(scrollValue)
  }, [])
  
  // Set up scroll listener
  useEffect(() => {
    // Initial scroll calculation
    handleScroll()
    
    // Add scroll listener with requestAnimationFrame for better performance
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])
  
  // Motion values for animations
  const paragraphOpacity = Math.max(0, Math.min(1, scrollProgress >= 0.167 ? 0 : 1 - (scrollProgress / 0.167)))
  const iconsOpacity = Math.max(0, Math.min(1, scrollProgress >= 0.167 ? 1 : scrollProgress / 0.167))
  const paragraphY = scrollProgress >= 0.167 ? -20 : -20 * (scrollProgress / 0.167)
  const iconsY = scrollProgress >= 0.167 ? 0 : 20 * (1 - scrollProgress / 0.167)
  
  
  return (
    <>
      {/* Spacer to push AboutUs below the fold */}
      <div className="h-[100vh]" />
      
      {/* AboutUs section - container for sticky scroll */}
      {/* This section must be tall enough (120vh) to allow sticky element to stick during scroll */}
      <section 
        ref={containerRef}
        data-aboutus-section="true"
        className="relative bg-transparent z-[4]"
        style={{
          backgroundColor: 'transparent',
          zIndex: 4,
          height: '120vh', // 100vh for sticky viewport + 20vh for scroll transition
          position: 'relative'
        }}
      >
        {/* Sticky container - stays fixed in viewport during scroll transition */}
        {/* This container remains in the same viewport position while scrolling through 20vh */}
        <div 
          ref={stickyContainerRef}
          data-sticky-container="true"
          className="sticky top-0 w-full max-w-7xl mx-auto px-4 md:px-6 py-24"
          style={{ 
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 5
          }}
        >
          {/* Title - stays visible throughout scroll */}
          <div className="mb-12 w-full text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center text-white whitespace-nowrap" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                <BlurTextAnimation 
                  text={aboutTitle}
                  fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  textColor="text-white"
                  animationDelay={0}
                />
              </h2>
          </div>

          {/* Content Container - Reorganized layout */}
          <div 
            className="max-w-md mx-auto lg:max-w-none w-full"
          >
            <div 
              className="flex flex-col lg:flex-row lg:gap-12 items-start lg:items-center"
            >
              {/* Left column - Paragraph first, then icons */}
              <div 
                className="flex-1 w-full lg:w-auto lg:h-[500px] lg:relative"
              >
                {/* Intro Paragraph - fades out as scrolling continues */}
                <div 
                  className="mb-8 lg:mb-0 lg:absolute lg:inset-0 lg:flex lg:items-center transition-opacity duration-0"
                  style={{
                    opacity: paragraphOpacity,
                    transform: `translateY(${paragraphY}px)`
                  }}
                >
                  <AnimatedParagraph 
                    text={introParagraph}
                    scrollProgress={scrollProgress}
                  />
                </div>
                
                {/* Icons Grid - fades in as paragraph fades out, aligned with globe */}
                <div 
                  className="space-y-6 lg:space-y-8 mt-8 lg:mt-0 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center transition-opacity duration-0"
                  style={{
                    opacity: iconsOpacity,
                    transform: `translateY(${iconsY}px)`
                  }}
                >
                  {textSections.map((section, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
                          {index === 0 && (
                            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 4 7 7c0 3 3 6 5 8 2-2 5-5 5-8 0-3-2-5-5-5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3M10 21h4" />
                              <circle cx="12" cy="12" r="9" strokeWidth={1} strokeDasharray="1.5 2" opacity="0.5" />
                            </svg>
                          )}
                          {index === 1 && (
                            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M4 18v-5c0-1 1-2 2-2h12c1 0 2 1 2 2v5" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 13h12M7 10h10" />
                              <circle cx="9" cy="14" r="0.8" fill="currentColor" />
                              <circle cx="12" cy="14" r="0.8" fill="currentColor" />
                              <circle cx="15" cy="14" r="0.8" fill="currentColor" />
                            </svg>
                          )}
                          {index === 2 && (
                            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 4 7 7c0 3 3 6 5 8 2-2 5-5 5-8 0-3-2-5-5-5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3M10 21h4" />
                              <circle cx="12" cy="12" r="9" strokeWidth={1} strokeDasharray="1.5 2" opacity="0.5" />
                            </svg>
                          )}
                          {index === 3 && (
                            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M4 18v-5c0-1 1-2 2-2h12c1 0 2 1 2 2v5" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 13h12M7 10h10" />
                              <line x1="17" y1="10" x2="17" y2="7" strokeLinecap="round" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l2-1" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl lg:text-2xl text-white font-semibold mb-2">{section.title}</h3>
                          <p className="text-base lg:text-lg text-white/90 leading-relaxed">{section.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Right column - Interactive Globe - stays in place */}
              <div 
                className="flex-1 flex items-center justify-center w-full lg:w-auto mt-8 lg:mt-0"
              >
                <div 
                  className="w-full h-[400px] lg:h-[500px]"
                >
                  <RotatingEarth width={600} height={500} className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Spacer to push next section - reduced spacing */}
      <div className="h-[20vh]" />
    </>
  )
}
