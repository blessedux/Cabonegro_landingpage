'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { usePathname } from 'next/navigation'

export default function AboutUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  
  // Determine locale from pathname
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const aboutTitle = locale === 'es' ? 'Cabo Negro: Una localización estratégica' : locale === 'zh' ? '卡波内格罗海事码头' : locale === 'fr' ? 'Terminal Maritime Cabo Negro' : 'Cabo Negro Maritime Terminal'
  
  // Track scroll progress based on section entering/exiting viewport
  // Start later to avoid covering Hero section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.5", "end start"] // Start when top is 50% down viewport (later), end when bottom enters top of viewport
  })
  
  // Multi-stage animation sequence:
  // Stage 1 (0-20%): Content stack slides up, everything visible
  // Stage 2 (20-40%): Text on left fades out, map stays constant
  // Stage 3 (40-60%): Icons fade in on left (where text was)
  // Stage 4 (60-80%): Everything fades out as vision title slides up
  
  // Stage 1: Content stack slides up
  const contentStackY = useTransform(scrollYProgress, [0, 0.20], [100, 0], { clamp: true })
  const contentStackOpacity = useTransform(scrollYProgress, [0, 0.10, 0.20], [0, 0, 1], { clamp: true })
  
  // Stage 2: Text on left fades out (20-40%) - smooth fade
  const textOpacity = useTransform(scrollYProgress, [0.20, 0.30, 0.40], [1, 0.5, 0], { clamp: true })
  const textY = useTransform(scrollYProgress, [0.20, 0.30, 0.40], [0, -10, -20], { clamp: true })
  
  // Stage 3: Icons fade in on left (40-60%) - one by one from top to bottom
  // Icon 1 (top) - fades in first
  const icon1Opacity = useTransform(scrollYProgress, [0.40, 0.45, 0.50], [0, 0, 1], { clamp: true })
  const icon1Y = useTransform(scrollYProgress, [0.40, 0.45, 0.50], [30, 30, 0], { clamp: true })
  
  // Icon 2 (middle) - fades in second
  const icon2Opacity = useTransform(scrollYProgress, [0.45, 0.50, 0.55], [0, 0, 1], { clamp: true })
  const icon2Y = useTransform(scrollYProgress, [0.45, 0.50, 0.55], [30, 30, 0], { clamp: true })
  
  // Icon 3 (bottom) - fades in last
  const icon3Opacity = useTransform(scrollYProgress, [0.50, 0.55, 0.60], [0, 0, 1], { clamp: true })
  const icon3Y = useTransform(scrollYProgress, [0.50, 0.55, 0.60], [30, 30, 0], { clamp: true })
  
  // Stage 4: Everything fades out (60-80%) as vision title slides up
  const aboutUsOpacity = useTransform(scrollYProgress, [0.60, 0.70, 0.80], [1, 1, 0], { clamp: true })
  
  // Title fades in early, stays visible until stage 4
  const titleOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.60, 0.70], [0, 0, 1, 1, 0], { clamp: true })
  const titleY = useTransform(scrollYProgress, [0, 0.05, 0.15], [60, 60, 0], { clamp: true })

  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(false)
  
  useMotionValueEvent(aboutUsOpacity, "change", (latest) => {
    // Only block pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })
  
  return (
    <>
      {/* Spacer to ensure scroll before AboutUs section */}
      <div className="h-[40vh] md:h-[80vh]" />
      
      {/* AboutUs section - sticky positioning to allow scrolling, above Hero */}
      <section 
        ref={sectionRef}
        data-aboutus-section="true"
        className="sticky top-0 left-0 right-0 min-h-[200vh] pt-48 md:pt-16 pb-8 md:pb-20 px-6 flex items-start justify-center z-[4] pointer-events-none overflow-y-auto"
        style={{
          backgroundColor: 'transparent',
          zIndex: 4 // Higher than Stats section (z-[3]) so AboutUs content can layer properly
        }}
      >
        {/* Content container - multi-stage animation */}
        <motion.div 
          className="container mx-auto max-w-7xl relative w-full py-8 md:py-20 flex flex-col justify-center text-white"
          initial={{ opacity: 0 }}
          style={{
            opacity: aboutUsOpacity,
            pointerEvents: shouldBlockPointer ? 'auto' : 'none',
            minHeight: 'calc(200vh - 4rem)',
            filter: 'brightness(1)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 6, // Above Stats background (z-[2]) but below Stats content (z-[7])
            isolation: 'isolate' // Create new stacking context to ensure proper layering
          }}
        >
          <div className="w-full flex flex-col items-center">
            {/* Title - centered - fades in early, stays until stage 4 */}
            <motion.div
              className="mb-12 w-full text-center"
              style={{
                opacity: titleOpacity,
                y: titleY
              }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-center text-white" style={{ color: '#ffffff', textShadow: '0 0 0 rgba(255,255,255,1)' }}>
                <BlurTextAnimation 
                  text={aboutTitle}
                  fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                  textColor="text-white"
                  animationDelay={0}
                />
              </h2>
            </motion.div>

            {/* Main content - two column layout: text/icons left, map right */}
            <motion.div 
              className="mb-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start"
              style={{
                y: contentStackY,
                opacity: contentStackOpacity
              }}
            >
              {/* Left column - contains both text and icons (overlapping) */}
              <div className="w-full text-left text-white relative" style={{ color: '#ffffff' }}>
                {/* Text content - fades out in stage 2 */}
                <motion.div
                  style={{
                    opacity: textOpacity,
                    y: textY,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0
                  }}
                >
                {locale === 'es' ? (
                  <div className="text-lg sm:text-xl text-white text-left leading-loose space-y-4">
                    <MagicText 
                      text="Chile es el país más austral del mundo."
                      className="block mb-4"
                    />
                    <MagicText 
                      text="En su extremo sur, la ciudad de Punta Arenas se ubica directamente sobre el Estrecho de Magallanes, uno de los corredores marítimos más relevantes y estratégicos del hemisferio sur."
                      className="block mb-4"
                    />
                    <MagicText 
                      text="El sector de Cabo Negro, a minutos de la ciudad, reúne condiciones únicas para el desarrollo portuario, logístico y tecnológico, consolidándose como nodo clave para el crecimiento industrial de Magallanes."
                      className="block"
                    />
                  </div>
                ) : (
              <MagicText 
                    text={locale === 'zh'
                  ? '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
                  : locale === 'fr'
                  ? 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
                  : 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'}
                    className="text-lg sm:text-xl text-white text-left leading-loose"
                  />
                )}
                </motion.div>
                
                {/* Icons - fade in in stage 3 (same position as text), one by one from top to bottom */}
                <div className="space-y-16 md:space-y-20 relative">
                  {/* Green Hydrogen - Icon 1 (top) - fades in first */}
              <motion.div
                    className="flex items-start gap-4"
                style={{
                      opacity: icon1Opacity,
                      y: icon1Y
                    }}
                  >
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 7 4 7 7c0 3 3 6 5 8 2-2 5-5 5-8 0-3-2-5-5-5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3M10 21h4" />
                        <circle cx="12" cy="12" r="9" strokeWidth={1} strokeDasharray="1.5 2" opacity="0.5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2 text-lg">Hidrógeno Verde</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Magallanes posee uno de los mayores potenciales eólicos del planeta
                  </p>
                </div>
              </motion.div>

                  {/* Alternative Shipping Route - Icon 2 (middle) - fades in second */}
              <motion.div
                    className="flex items-start gap-4"
                style={{
                      opacity: icon2Opacity,
                      y: icon2Y
                    }}
                  >
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M4 18v-5c0-1 1-2 2-2h12c1 0 2 1 2 2v5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13h12M7 10h10" />
                        <circle cx="9" cy="14" r="0.8" fill="currentColor" />
                        <circle cx="12" cy="14" r="0.8" fill="currentColor" />
                        <circle cx="15" cy="14" r="0.8" fill="currentColor" />
                        <line x1="17" y1="10" x2="17" y2="7" strokeLinecap="round" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l2-1" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2 text-lg">Ruta alternativa al Canal de Panamá</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Paso natural libre de peajes y confiable ante restricciones globales.
                  </p>
                </div>
                  </motion.div>

                  {/* Satellite and Technology Ecosystem - Icon 3 (bottom) - fades in last */}
                  <motion.div 
                    className="flex items-start gap-4"
                    style={{
                      opacity: icon3Opacity,
                      y: icon3Y
                    }}
                  >
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4 0-6 2-6 6 0 2 1 4 3 5M18 9c0-4-2-6-6-6M12 14c2-1 3-3 3-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l2-2 2 2M12 17v2" />
                        <path strokeLinecap="round" d="M5 7c-1 0-1.5 0.5-1.5 1M19 7c1 0 1.5 0.5 1.5 1" opacity="0.5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2 text-lg">Ecosistema satelital y tecnológico</h3>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Condiciones ideales para estaciones de telecomunicaciones globales y data centers.
                      </p>
                    </div>
              </motion.div>
                </div>
              </div>
              
              {/* Map placeholder - simple static container on the right */}
              <div 
                className="w-full h-[400px] lg:h-[500px] bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-gray-400">
                  <svg 
                    className="w-24 h-24 mx-auto mb-4 opacity-50" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                    />
                  </svg>
                  <p className="text-sm font-medium">Mapa Interactivo</p>
                  <p className="text-xs mt-2 opacity-75">Próximamente</p>
                </div>
              </div>
              </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Spacer to push next section */}
      <div className="h-[100vh] md:h-[80vh]" />
    </>
  )
}
