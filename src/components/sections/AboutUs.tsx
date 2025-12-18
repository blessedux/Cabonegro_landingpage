'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MdDirectionsBoat, MdEnergySavingsLeaf } from 'react-icons/md'
import Icon from '@mdi/react'
import { mdiGantryCrane, mdiSatelliteVariant } from '@mdi/js'

// Code-split RotatingEarth component (includes D3.js ~200KB) - only load when needed
const RotatingEarth = dynamic(() => import('@/components/ui/rotating-earth'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] flex items-center justify-center"><div className="text-white">Loading globe...</div></div>
})

// Lazy load wrapper using Intersection Observer - only loads when component is about to enter viewport
function LazyRotatingEarth({ width = 600, height = 400, className = "" }: { width?: number; height?: number; className?: string }) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Start loading when element is 200px away from viewport (rootMargin)
          if (entry.isIntersecting && !shouldLoad) {
            console.log('🌍 [LazyRotatingEarth] Component entering viewport - loading RotatingEarth')
            setShouldLoad(true)
            // Disconnect observer once we've triggered the load
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px', // Start loading 200px before it enters viewport
        threshold: 0.01
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  return (
    <div ref={containerRef} className={className} style={{ width, height, minHeight: height }}>
      {shouldLoad ? (
        <RotatingEarth width={width} height={height} className={className} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
          <div className="text-white/60 text-sm">Globe will load when visible</div>
        </div>
      )}
    </div>
  )
}

interface TextSection {
  label: string
  title: string
  description: string
}

// Important words to make bold (case-insensitive) - reduced to half
const getImportantWords = (locale: string): string[] => {
  if (locale === 'es') {
    return ['Cabo Negro', 'Estrecho de Magallanes', 'Magallanes', 'portuario', 'logístico', 'tecnológico', 'nodo', 'industrial']
  } else if (locale === 'zh') {
    return ['卡波内格罗', '智利', '绿色氢', '战略']
  } else if (locale === 'fr') {
    return ['Cabo Negro', 'développement', 'industriel', 'maritime', 'hydrogène', 'vert']
  } else {
    return ['Cabo Negro', 'southernmost', 'strategic', 'gateway', 'green', 'hydrogen']
  }
}

// AnimatedWord component matching Stats component pattern
function AnimatedWord({ 
  word, 
  index, 
  totalWords, 
  scrollYProgress,
  isImportant = false
}: { 
  word: string
  index: number
  totalWords: number
  scrollYProgress: any
  isImportant?: boolean
}) {
  const start = index / totalWords;
  const end = Math.min(start + 1 / totalWords, 0.99);
  // Once opacity reaches 1, it stays at 1 (no fade out) - use clamp and ensure it never goes below the max reached value
  const opacity = useTransform(
    scrollYProgress, 
    [start, end, 1], 
    [0, 1, 1], // Third value ensures it stays at 1
    { clamp: true }
  );

  return (
    <span className="relative mr-2">
      <span className="absolute opacity-20">{word}</span>
      <motion.span 
        style={{ opacity: opacity }}
        className={isImportant ? 'font-bold' : ''}
      >
        {word}
      </motion.span>
    </span>
  );
}

// Paragraph wrapper with scroll-based word animation - matching Stats component
function AnimatedParagraph({ text, className = "", locale = 'en' }: { text: string; className?: string; locale?: string }) {
  const container = useRef<HTMLParagraphElement>(null);
  
  // Animation starts when element enters viewport, completes quickly
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 1.5", "start 0.8"], // Start earlier, complete early - similar to Stats component
  });
  
  const words = text.split(" ");
  const importantWords = getImportantWords(locale);

  return (
    <p 
      ref={container} 
      className={`flex flex-wrap leading-relaxed ${className}`} 
      style={{ 
        color: '#ffffff',
        fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', // Smaller font size
        lineHeight: '2', // Good spacing between lines
        letterSpacing: '0.01em'
      }}
    >
      {words.map((word, i) => {
        // Check if word (without punctuation) is important
        const cleanWord = word.replace(/[.,;:!?¿¡]/g, '');
        const isImportant = importantWords.some(important => 
          cleanWord.toLowerCase() === important.toLowerCase() ||
          cleanWord.toLowerCase().includes(important.toLowerCase()) ||
          important.toLowerCase().includes(cleanWord.toLowerCase())
        );
        
        return (
          <AnimatedWord 
            key={i}
            word={word}
            index={i}
            totalWords={words.length}
            scrollYProgress={scrollYProgress}
            isImportant={isImportant}
          />
        );
      })}
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
  
  // Define icon sections based on locale - matching todo.md lines 54-57
  const textSections: TextSection[] = locale === 'es' ? [
    {
      label: 'Ruta Alternativa',
      title: 'Ruta alternativa al Canal de Panamá',
      description: 'Paso natural libre de peajes y confiable ante restricciones globales, conectando los océanos Atlántico y Pacífico.'
    },
    {
      label: 'Hidrógeno Verde',
      title: 'Capital energética del hidrógeno verde',
      description: 'Magallanes posee uno de los mayores potenciales eólicos del planeta, ideal para la producción de hidrógeno verde y energías renovables.'
    },
    {
      label: 'Tecnología',
      title: 'Ecosistema satelital y tecnológico',
      description: 'Infraestructura de conectividad avanzada con fibra óptica, órbita LEO y proximidad a centros tecnológicos.'
    },
    {
      label: 'Logística',
      title: 'Nodo logístico industrial',
      description: 'Cabo Negro reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes.'
    }
  ] : locale === 'zh' ? [
    {
      label: 'Trade Routes',
      title: '巴拿马运河的替代路线',
      description: '连接大西洋和太平洋的天然通道，免通行费且可靠。'
    },
    {
      label: 'Green Hydrogen',
      title: '绿色氢能源之都',
      description: '作为智利绿色氢经济的战略门户，推动可再生能源发展。'
    },
    {
      label: 'Technology',
      title: '卫星和技术生态系统',
      description: '先进连接基础设施，包括光纤、低地球轨道和接近技术中心。'
    },
    {
      label: 'Logistics',
      title: '工业物流节点',
      description: '卡波内格罗作为港口、物流和技术发展的关键节点。'
    }
  ] : locale === 'fr' ? [
    {
      label: 'Routes Commerciales',
      title: 'Route alternative au Canal de Panama',
      description: 'Passage naturel sans péage et fiable face aux restrictions mondiales, reliant les océans Atlantique et Pacifique.'
    },
    {
      label: 'Hydrogène Vert',
      title: 'Capitale énergétique de l\'hydrogène vert',
      description: 'Porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili.'
    },
    {
      label: 'Technologie',
      title: 'Écosystème satellitaire et technologique',
      description: 'Infrastructure de connectivité avancée avec fibre optique, orbite LEO et proximité des centres technologiques.'
    },
    {
      label: 'Logistique',
      title: 'Nœud logistique industriel',
      description: 'Cabo Negro réunit des conditions uniques pour le développement portuaire, logistique et technologique.'
    }
  ] : [
    {
      label: 'Trade Routes',
      title: 'Alternative Route to Panama Canal',
      description: 'Natural passage free of tolls and reliable in the face of global restrictions, connecting the Atlantic and Pacific oceans.'
    },
    {
      label: 'Green Hydrogen',
      title: 'Green Hydrogen Energy Capital',
      description: 'Positioned as the strategic gateway for Chile\'s green hydrogen economy, driving renewable energy development.'
    },
    {
      label: 'Technology',
      title: 'Satellite and Technology Ecosystem',
      description: 'Advanced connectivity infrastructure with fiber optics, LEO orbit, and proximity to technology centers.'
    },
    {
      label: 'Logistics',
      title: 'Industrial Logistics Hub',
      description: 'Cabo Negro brings together unique conditions for port, logistics, and technological development.'
    }
  ]

  const iconsContainerRef = useRef<HTMLDivElement>(null)
  const [iconOpacities, setIconOpacities] = useState<number[]>([0, 0, 0, 0])
  const maxOpacitiesRef = useRef<number[]>([0, 0, 0, 0]) // Track maximum opacity reached for each icon
  const [hoveredCard, setHoveredCard] = useState<number | null>(null) // Track which card is hovered

  // Track scroll for icon fade-in animation - icons stay visible once they fade in
  useEffect(() => {
    const handleIconScroll = () => {
      if (!iconsContainerRef.current) return
      
      const rect = iconsContainerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      // Trigger earlier - when container top is 80% down the viewport (sooner)
      const triggerPoint = viewportHeight * 0.8
      
      const icons = iconsContainerRef.current.children
      const newOpacities: number[] = []
      
      // Only calculate if icons container is in viewport or has been in viewport
      if (rect.bottom > 0) {
        for (let i = 0; i < icons.length; i++) {
          const iconRect = icons[i].getBoundingClientRect()
          const iconTop = iconRect.top
          const iconCenter = iconTop + iconRect.height / 2
          
          // Each icon fades in when its center passes the trigger point
          // Staggered by 50px between each icon
          // Fade in over 80px for quicker animation
          const iconTriggerPoint = triggerPoint - (i * 50)
          const distance = iconCenter - iconTriggerPoint
          
          let opacity = 0
          if (distance < 0) {
            // Icon has passed trigger point - fade in
            opacity = Math.min(1, 1 + (distance / 80))
          } else if (distance < 80) {
            // Icon is approaching trigger point - start fading in
            opacity = Math.max(0, 1 - (distance / 80))
          }
          
          opacity = Math.max(0, Math.min(1, opacity))
          
          // Track maximum opacity reached - once an icon reaches full opacity, keep it visible
          if (opacity > maxOpacitiesRef.current[i]) {
            maxOpacitiesRef.current[i] = opacity
          }
          
          // If icon has been fully visible before, keep it at max opacity (don't fade out when scrolling down)
          // Only fade out if scrolling back up above the section
          if (maxOpacitiesRef.current[i] >= 1 && rect.top < viewportHeight * 1.5) {
            // Keep at full opacity if we've seen it fully visible and we're still in/near the section
            opacity = 1
          } else if (maxOpacitiesRef.current[i] >= 1 && rect.top > viewportHeight * 1.5) {
            // Only fade out if we scroll way back up (above 1.5 viewport heights)
            opacity = Math.max(0, opacity)
          } else {
            // Use calculated opacity
            opacity = Math.max(maxOpacitiesRef.current[i], opacity)
          }
          
          newOpacities.push(opacity)
        }
      } else {
        // Icons are above viewport - use max opacities if they've been visible, otherwise 0
        for (let i = 0; i < icons.length; i++) {
          if (maxOpacitiesRef.current[i] >= 1 && rect.top < viewportHeight * 2) {
            // Keep visible if we've seen it and we're not too far up
            newOpacities.push(1)
          } else {
            newOpacities.push(0)
          }
        }
      }
      
      setIconOpacities(newOpacities)
    }
    
    window.addEventListener('scroll', handleIconScroll, { passive: true })
    handleIconScroll() // Initial calculation
    
    return () => {
      window.removeEventListener('scroll', handleIconScroll)
    }
  }, [])
  
  
  return (
    <>
      {/* Spacer to push AboutUs below the fold */}
      <div className="h-[100vh]" />
      
      {/* AboutUs section */}
      <section 
        id="about"
        data-aboutus-section="true"
        className="relative bg-transparent z-[4] py-24"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Title */}
          <div className="mb-16 w-full text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center text-white" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              <BlurTextAnimation 
                text={aboutTitle}
                fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                textColor="text-white"
                animationDelay={0}
              />
            </h2>
          </div>

          {/* Content Container - Paragraph left, Globe right */}
          <div className="flex flex-col lg:flex-row lg:gap-12 items-start lg:items-start mb-12">
            {/* Left column - Paragraph */}
            <div className="flex-1 w-full lg:w-1/2 mb-12 lg:mb-0">
              <div className="p-4" style={{ maxHeight: '400px', overflow: 'hidden' }}>
                <AnimatedParagraph 
                  text={introParagraph}
                  locale={locale}
                />
              </div>
            </div>
            
            {/* Right column - Globe - Lazy loaded */}
            <div className="flex-1 w-full lg:w-1/2">
              <LazyRotatingEarth width={600} height={400} className="w-full h-full" />
            </div>
          </div>
          
          {/* Icons Grid - Full width, horizontal layout (4 columns) */}
          <div ref={iconsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-stretch">
            {textSections.map((section, index) => {
              const isHovered = hoveredCard === index
              return (
                <div
                  key={index}
                  className="flex flex-col items-start text-left p-6 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/30 h-full"
                  style={{ 
                    opacity: iconOpacities[index] || 0,
                    transform: `translateY(${iconOpacities[index] ? 0 : 20}px)`,
                    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHoveredCard(index)
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                    setHoveredCard(null)
                  }}
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-4">
                    {index === 0 && (
                      <MdDirectionsBoat className="w-full h-full text-white" />
                    )}
                    {index === 1 && (
                      <MdEnergySavingsLeaf className="w-full h-full text-white" />
                    )}
                    {index === 2 && (
                      <Icon path={mdiSatelliteVariant} size={80} className="text-white w-full h-full" />
                    )}
                    {index === 3 && (
                      <Icon path={mdiGantryCrane} size={80} className="text-white w-full h-full" />
                    )}
                  </div>
                  <h3 className="text-lg lg:text-xl text-white font-semibold mb-2">{section.title}</h3>
                  <div 
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isHovered ? '24rem' : '0',
                      minHeight: isHovered ? 'auto' : '0',
                    }}
                  >
                    <p 
                      className={`text-sm lg:text-base text-white/90 leading-relaxed transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Spacer to push next section */}
      <div className="h-[20vh]" />
    </>
  )
}
