'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { usePathname } from 'next/navigation'
import RotatingEarth from '@/components/ui/rotating-earth'

interface TextSection {
  label: string
  title: string
  description: string
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

  const sectionRef = useRef<HTMLElement>(null)
  
  // Track scroll progress relative to section
  // When section top hits viewport top (progress = 0), content becomes sticky
  // We need enough scroll distance for the crossfade transition
  // Progress 0 = section top at viewport top (sticky starts)
  // Progress 0.5 = halfway through section (crossfade complete)
  // Progress 1 = section bottom at viewport top (sticky ends, can scroll to stats)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"] // Start when section top hits viewport top, end when section bottom hits viewport top
  })
  
  
  // Content becomes sticky when section top reaches viewport (scrollYProgress = 0)
  // As we continue scrolling, fade out title and paragraph, fade in icons
  // Progress: 0 = section top at viewport top, 1 = section bottom at viewport top
  
  // Title fades out as we scroll (0 to 0.3 of scroll progress)
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0], { clamp: true })
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -20], { clamp: true })
  
  // Paragraph fades out slightly after title (0.1 to 0.4)
  const paragraphOpacity = useTransform(scrollYProgress, [0.1, 0.4], [1, 0], { clamp: true })
  const paragraphY = useTransform(scrollYProgress, [0.1, 0.4], [0, -20], { clamp: true })
  
  // Icons fade in as title/paragraph fade out (0.2 to 0.5)
  const iconsOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1], { clamp: true })
  const iconsY = useTransform(scrollYProgress, [0.2, 0.5], [20, 0], { clamp: true })
  
  
  return (
    <>
      {/* Spacer to ensure scroll before AboutUs section - increased to push it below fold */}
      <div className="h-[100vh] md:h-[120vh]" />
      
      {/* AboutUs section */}
      <section 
        ref={sectionRef}
        data-aboutus-section="true"
        className="relative flex flex-col justify-center bg-transparent overflow-hidden supports-[overflow:clip]:overflow-clip z-[4]"
        style={{
          backgroundColor: 'transparent',
          zIndex: 4,
          minHeight: '200vh' // Increased to allow sticky scroll - needs enough space for crossfade transition
        }}
      >
        {/* Sticky container - becomes sticky when section top hits viewport */}
        {/* This container stays in place during the crossfade transition */}
        <div 
          data-sticky-container="true"
          className="sticky top-0 left-0 right-0 w-full max-w-7xl mx-auto px-4 md:px-6 py-24"
          style={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            willChange: 'transform', // Optimize for sticky positioning
            zIndex: 5 // Ensure it's above other content
          }}
        >
          {/* Title - fades out as scrolling continues */}
          <motion.div 
            className="mb-12 w-full text-center" 
            style={{ 
              opacity: titleOpacity,
              y: titleY
            }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-center text-white whitespace-nowrap" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                <BlurTextAnimation 
                  text={aboutTitle}
                  fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                  textColor="text-white"
                  animationDelay={0}
                />
              </h2>
          </motion.div>

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
                <motion.div 
                  className="mb-8 lg:mb-0 lg:absolute lg:inset-0 lg:flex lg:items-center"
                  style={{
                    opacity: paragraphOpacity,
                    y: paragraphY
                  }}
                >
                  <p className="text-lg sm:text-xl text-white leading-[2]">
                    {introParagraph}
                  </p>
                </motion.div>
                
                {/* Icons Grid - fades in as paragraph fades out, aligned with globe */}
                <motion.div 
                  className="space-y-6 lg:space-y-8 mt-8 lg:mt-0 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center"
                  style={{
                    opacity: iconsOpacity,
                    y: iconsY
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
                </motion.div>
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
      
      {/* Spacer to push next section - reduced since section is more compact */}
      <div className="h-[40vh] md:h-[50vh]" />
    </>
  )
}
