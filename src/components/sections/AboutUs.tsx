'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function AboutUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  
  // Determine locale from pathname for button text
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const buttonText = locale === 'es' ? 'Explorar Terreno' : locale === 'zh' ? '探索地形' : locale === 'fr' ? 'Explorer le Terrain' : 'Explore Terrain'
  const aboutTitle = locale === 'es' ? 'Terminal Maritimo Cabo Negro' : locale === 'zh' ? '卡波内格罗海事码头' : locale === 'fr' ? 'Terminal Maritime Cabo Negro' : 'Cabo Negro Maritime Terminal'
  
  // Track scroll progress based on section entering/exiting viewport
  // Fade in when top enters viewport, fade out when bottom enters viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"] // Start when top enters bottom of viewport, end when bottom enters top of viewport
  })
  
  // AboutUs content fades in smoothly starting at 1% (overlapping with Hero fade-out)
  // Smooth crossfade: Hero fades out 2%-4%, AboutUs fades in 1%-5%
  // Stays visible (5% to 0.7)
  // Fades out as bottom enters viewport (0.7 to 1)
  // Use clamp to ensure it never goes below 0
  const aboutUsOpacity = useTransform(scrollYProgress, [0, 0.01, 0.05, 0.7, 1], [0, 0, 1, 1, 0], { clamp: true })
  
  // Create a magnetic snap effect - content snaps to center with spring physics
  // Calculate center position based on scroll progress - smoother entry
  const rawAboutUsY = useTransform(scrollYProgress, [0, 0.01, 0.05, 0.5, 0.7, 1], [80, 80, 0, 0, 0, -50])
  // Apply spring physics for magnetic snap feel - smoother with less damping
  const aboutUsY = useSpring(rawAboutUsY, { 
    stiffness: 80, 
    damping: 25,
    mass: 0.6
  })

  // Title starts fading in slightly before main content for smoother transition
  const titleOpacity = useTransform(scrollYProgress, [0, 0.01, 0.04], [0, 0, 1], { clamp: true })
  const rawTitleY = useTransform(scrollYProgress, [0, 0.01, 0.04, 0.5], [60, 60, 0, 0])
  // Apply spring physics to title as well - smoother
  const titleY = useSpring(rawTitleY, { 
    stiffness: 100, 
    damping: 20,
    mass: 0.5
  })

  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(false)
  
  useMotionValueEvent(aboutUsOpacity, "change", (latest) => {
    // Only block pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })
  
  // Handle View Terrain click
  const handleViewTerrain = () => {
    showPreloaderB()
    // Determine locale from pathname
    const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
    const explorePath = locale === 'en' ? '/explore' : `/${locale}/explore`
    setTimeout(() => {
      router.push(explorePath)
    }, 100)
  }

  return (
    <>
      {/* Spacer to ensure scroll before AboutUs section */}
      <div className="h-[40vh] md:h-[80vh]" />
      
      {/* AboutUs section - sticky positioning to allow scrolling, above Hero */}
      <section 
        ref={sectionRef}
        data-aboutus-section="true"
        className="sticky top-0 left-0 right-0 min-h-[200vh] pt-48 md:pt-16 pb-8 md:pb-20 px-6 flex items-start justify-center z-[9] pointer-events-none overflow-y-auto"
        style={{
          backgroundColor: 'transparent'
        }}
      >
        {/* Content container - fades in as Hero fades out */}
        <motion.div 
          className="container mx-auto max-w-7xl relative z-10 w-full py-8 md:py-20 flex flex-col justify-center text-white"
          initial={{ opacity: 0 }}
          style={{
            opacity: aboutUsOpacity,
            y: aboutUsY,
            pointerEvents: shouldBlockPointer ? 'auto' : 'none',
            minHeight: 'calc(200vh - 4rem)',
            filter: 'brightness(1)',
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          <div className="w-full flex flex-col items-center">
            {/* Title - centered - fades in */}
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

            {/* Main content - centered */}
            <div className="mb-12 w-full max-w-3xl mx-auto text-center text-white" style={{ color: '#ffffff' }}>
              <MagicText 
                text={locale === 'es' 
                  ? 'Cabo Negro representa un desarrollo industrial y marítimo visionario en el extremo sur de Chile, diseñado para servir como puerta de entrada estratégica para la economía del hidrógeno verde de Chile y las rutas comerciales internacionales.'
                  : locale === 'zh'
                  ? '卡波内格罗代表了智利最南端的远见性工业和海事发展，旨在作为智利绿色氢经济和国际贸易路线的战略门户。'
                  : locale === 'fr'
                  ? 'Cabo Negro représente un développement industriel et maritime visionnaire à la pointe sud du Chili, conçu pour servir de porte d\'entrée stratégique pour l\'économie de l\'hydrogène vert du Chili et les routes commerciales internationales.'
                  : 'Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile\'s green hydrogen economy and international trade routes.'}
                className="text-lg sm:text-xl text-white text-center leading-relaxed"
              />
            </div>
            
            {/* Three Business Cards */}
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* El Puerto Card */}
              <motion.div
                className="bg-black/50 backdrop-blur-md rounded-xl border border-white/30 p-6 md:p-8 flex flex-col"
                style={{
                  opacity: aboutUsOpacity,
                }}
              >
                <div className="mb-4">
                  <img 
                    src="/maritime_terminal.png" 
                    alt="El Puerto" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    {locale === 'es' ? 'El Puerto' : locale === 'zh' ? '港口' : locale === 'fr' ? 'Le Port' : 'The Port'}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                    {locale === 'es' 
                      ? 'Terminal marítimo estratégico con maqueta digital interactiva y cartografía detallada del desarrollo portuario y sus capacidades logísticas.'
                      : locale === 'zh'
                      ? '战略海事码头，配有交互式数字模型和详细的港口开发及物流能力制图。'
                      : locale === 'fr'
                      ? 'Terminal maritime stratégique avec maquette numérique interactive et cartographie détaillée du développement portuaire et de ses capacités logistiques.'
                      : 'Strategic maritime terminal featuring an interactive digital mockup and detailed cartography of port development and logistics capabilities.'}
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="uppercase border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300 mt-auto"
                  onClick={handleViewTerrain}
                >
                  {buttonText}
                </Button>
              </motion.div>

              {/* Patagon Valley Card */}
              <motion.div
                className="bg-black/50 backdrop-blur-md rounded-xl border border-white/30 p-6 md:p-8 flex flex-col"
                style={{
                  opacity: aboutUsOpacity,
                }}
              >
                <div className="mb-4">
                  <img 
                    src="/lots_model.png" 
                    alt="Patagon Valley" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    Patagon Valley
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                    {locale === 'es'
                      ? 'Desarrollo inmobiliario estratégico con infraestructura tecnológica avanzada, incluyendo instalaciones de AWS y GTD.'
                      : locale === 'zh'
                      ? '战略性房地产开发，配备先进的技术基础设施，包括AWS和GTD设施。'
                      : locale === 'fr'
                      ? 'Développement immobilier stratégique avec infrastructure technologique avancée, incluant les installations AWS et GTD.'
                      : 'Strategic real estate development with advanced technological infrastructure, including AWS and GTD facilities.'}
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="uppercase border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300 mt-auto"
                  onClick={() => {
                    showPreloaderB()
                    const patagonPath = locale === 'en' ? '/patagon-valley' : `/${locale}/patagon-valley`
                    setTimeout(() => {
                      router.push(patagonPath)
                    }, 100)
                  }}
                >
                  {locale === 'es' ? 'Explorar' : locale === 'zh' ? '探索' : locale === 'fr' ? 'Explorer' : 'Explore'}
                </Button>
              </motion.div>

              {/* Parque Industrial Cabonegro Card */}
              <motion.div
                className="bg-black/50 backdrop-blur-md rounded-xl border border-white/30 p-6 md:p-8 flex flex-col"
                style={{
                  opacity: aboutUsOpacity,
                }}
              >
                <div className="mb-4">
                  <img 
                    src="/cabonegro_wirefram2.webp" 
                    alt="Parque Industrial Cabonegro" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    {locale === 'es' ? 'Parque Industrial Cabonegro' : locale === 'zh' ? '卡波内格罗工业园' : locale === 'fr' ? 'Parc Industriel Cabo Negro' : 'Cabo Negro Industrial Park'}
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                    {locale === 'es'
                      ? 'Zona industrial integral diseñada para soportar la economía del hidrógeno verde y facilitar el comercio internacional en el extremo sur de Chile.'
                      : locale === 'zh'
                      ? '综合性工业区，旨在支持绿色氢经济并促进智利最南端的国际贸易。'
                      : locale === 'fr'
                      ? 'Zone industrielle complète conçue pour soutenir l\'économie de l\'hydrogène vert et faciliter le commerce international à la pointe sud du Chili.'
                      : 'Comprehensive industrial zone designed to support the green hydrogen economy and facilitate international trade at Chile\'s southernmost tip.'}
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="uppercase border-accent text-accent hover:bg-accent hover:text-white transition-colors duration-300 mt-auto"
                  onClick={() => {
                    showPreloaderB()
                    const industrialPath = locale === 'en' ? '/industrial-park' : `/${locale}/industrial-park`
                    setTimeout(() => {
                      router.push(industrialPath)
                    }, 100)
                  }}
                >
                  {locale === 'es' ? 'Explorar' : locale === 'zh' ? '探索' : locale === 'fr' ? 'Explorer' : 'Explore'}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Spacer to push next section */}
      <div className="h-[100vh] md:h-[80vh]" />
    </>
  )
}
