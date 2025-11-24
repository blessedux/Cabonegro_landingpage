'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { usePreloader } from '@/contexts/PreloaderContext'

// Custom MagicText wrapper that animates earlier (when element enters from bottom of viewport)
function EarlyMagicText({ text, className = "" }: { text: string; className?: string }) {
  const container = useRef<HTMLParagraphElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 1.5", "start 0.8"], // Start as soon as possible (1.5 viewport heights away), complete early (0.8 viewport heights)
  });
  
  const words = text.split(" ");

  return (
    <p ref={container} className={`flex flex-wrap leading-relaxed ${className}`} style={{ color: '#ffffff' }}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);

        return (
          <span key={i} className="relative mr-1">
            <span className="absolute opacity-20">{word}</span>
            <motion.span style={{ opacity: opacity }}>{word}</motion.span>
          </span>
        );
      })}
    </p>
  );
}

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
  start?: number
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', className = '', start = 0 }: AnimatedCounterProps) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * (end - start) + start
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration, start])

  return (
    <div ref={ref} className={className}>
      {prefix}{end === 2.1 ? count.toFixed(1) : Math.round(count)}{suffix}
    </div>
  )
}

export default function Stats() {
  const statsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { showPreloaderB } = usePreloader()
  
  // Determine locale from pathname for button text
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : 'en'
  const buttonText = locale === 'es' ? 'Explorar Terreno' : locale === 'zh' ? '探索地形' : locale === 'fr' ? 'Explorer le Terrain' : 'Explore Terrain'
  
  // Find AboutUs section to use its bottom as trigger point and track its scroll progress
  const aboutUsSectionRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    aboutUsSectionRef.current = document.querySelector('[data-aboutus-section="true"]') as HTMLElement
  }, [])
  
  // Track AboutUs section scroll progress to sync duplicate content opacity
  const { scrollYProgress: aboutUsScrollProgress } = useScroll({
    target: aboutUsSectionRef,
    offset: ["start end", "end start"]
  })
  
  // AboutUs content opacity - matches the original AboutUs component
  const aboutUsOpacity = useTransform(aboutUsScrollProgress, [0, 0.01, 0.05, 0.7, 1], [0, 0, 1, 1, 0], { clamp: true })
  const rawAboutUsY = useTransform(aboutUsScrollProgress, [0, 0.01, 0.05, 0.5, 0.7, 1], [80, 80, 0, 0, 0, -50])
  const aboutUsY = useSpring(rawAboutUsY, { 
    stiffness: 80, 
    damping: 25,
    mass: 0.6
  })
  
  // Title opacity for duplicate
  const duplicateTitleOpacity = useTransform(aboutUsScrollProgress, [0, 0.01, 0.04], [0, 0, 1], { clamp: true })
  const rawDuplicateTitleY = useTransform(aboutUsScrollProgress, [0, 0.01, 0.04, 0.5], [60, 60, 0, 0])
  const duplicateTitleY = useSpring(rawDuplicateTitleY, { 
    stiffness: 100, 
    damping: 20,
    mass: 0.5
  })
  
  // Track scroll progress - Stats trigger starts when bottom of AboutUs section is reached
  // Offset: ["end end", "end start"] means:
  // - Start (0): when bottom of AboutUs reaches bottom of viewport
  // - End (1): when bottom of AboutUs reaches top of viewport
  const { scrollYProgress } = useScroll({
    target: aboutUsSectionRef,
    offset: ["end end", "end start"]
  })

  // Track when Partners section reaches 50% of viewport (center line)
  // Use useEffect to find Partners section by data attribute
  const partnersSectionRef = useRef<HTMLElement | null>(null)
  
  useEffect(() => {
    partnersSectionRef.current = document.querySelector('[data-partners-section="true"]') as HTMLElement
  }, [])
  
  const { scrollYProgress: partnersScrollProgress } = useScroll({
    target: partnersSectionRef,
    offset: ["start center", "start start"]
  })

  // Background fade in - starts at 11% scroll, completes at 20% scroll (9% fade window for smoother blend)
  const backgroundOpacity = useTransform(scrollYProgress, [0.11, 0.20], [0, 1])
  
  // Background zoom effect - scales from 1 to 1.1 (10% zoom) as we scroll from top to bottom
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1], { clamp: true })
  
  // Black overlay opacity - only appears when Stats background is visible (starts at 11%, completes at 20%)
  // This ensures it doesn't darken Hero/AboutUs sections
  const blackOverlayOpacity = useTransform(scrollYProgress, [0.11, 0.20], [0, 1])
  
  // Title fade in - starts when background starts fading in (11%)
  // Content should be visible as soon as background appears
  const titleOpacity = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 0])
  
  // Content fade in - smooth fade from 11% to 15% (when background appears)
  const contentOpacity = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 1])
  const contentY = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 0])
  
  // Vision text fade in - starts when background appears (11%)
  // Title and subtitle fade in together
  const visionTitleOpacity = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 1])
  const visionSubtitleOpacity = useTransform(scrollYProgress, [0, 0.11, 0.15], [0, 0, 1])
  
  // Position orange container at the very top, close to AboutUs component
  // At 0%: container at top (top: 0, y: 0)
  // At 11%: container positioned at very top (top: 0%, y: -50%) - at the very top
  // After 11%: stays in position
  const containerTop = useTransform(scrollYProgress, [0, 0.11, 0.20], ['0%', '0%', '0%'], { clamp: true })
  const containerY = useTransform(scrollYProgress, [0, 0.11, 0.20], ['0%', '-50%', '-50%'], { clamp: true })
  
  // Fade to white when Partners reaches above 50% of viewport (center line)
  // Partners scroll progress: 0 = Partners at center, 1 = Partners at top
  const whiteOverlayOpacity = useTransform(partnersScrollProgress, [0, 1], [0, 1])

  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(false)
  
  useMotionValueEvent(contentOpacity, "change", (latest) => {
    // Only block pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })

  return (
    <>
      {/* Stats section - sticky positioning to allow scrolling */}
      <section 
        ref={statsRef} 
        className="sticky top-0 left-0 right-0 h-[100vh] z-[10] pointer-events-none"
      >
        {/* Content container - positioned at top, centers in viewport when background fades in (11% scroll) */}
        <motion.div
          className="absolute left-0 right-0 z-[11] w-full flex flex-col justify-start"
          style={{
            pointerEvents: shouldBlockPointer ? 'auto' : 'none',
            top: containerTop,
            y: containerY
          }}
        >
          
          {/* Content wrapper - no margins, matches section positioning, content at top */}
          <div className="w-full max-w-7xl mx-auto px-6 pt-0">
            {/* Our Vision - only visible in Stats section, fades in when background appears */}
            <motion.div
              className="w-full mb-[30vh]"
            >
              <div className="text-center">
                <motion.h3 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-white" 
                  style={{ 
                    opacity: visionTitleOpacity,
                    color: '#ffffff', 
                    textShadow: '0 0 0 rgba(255,255,255,1)' 
                  }}
                >
                  {locale === 'es' ? 'Nuestra Visión' : locale === 'zh' ? '我们的愿景' : locale === 'fr' ? 'Notre Vision' : 'Our Vision'}
                </motion.h3>
                <motion.div
                  style={{ opacity: visionSubtitleOpacity }}
                  className="max-w-5xl mx-auto"
                >
                  <EarlyMagicText 
                    text={locale === 'es'
                      ? 'Establecer Cabo Negro como el principal centro industrial y marítimo del Hemisferio Sur, sirviendo como puerta de entrada principal a la Antártida y un nodo esencial en las rutas comerciales globales mientras se apoya la transición de Chile hacia una economía de hidrógeno verde.'
                      : locale === 'zh'
                      ? '将卡波内格罗确立为南半球首屈一指的工业和海事中心，作为通往南极洲的主要门户和全球贸易路线的重要节点，同时支持智利向绿色氢经济的转型。'
                      : locale === 'fr'
                      ? 'Établir Cabo Negro comme le principal centre industriel et maritime de l\'Hémisphère Sud, servant de porte d\'entrée principale vers l\'Antarctique et de nœud essentiel dans les routes commerciales mondiales tout en soutenant la transition du Chili vers une économie de l\'hydrogène vert.'
                      : 'To establish Cabo Negro as the premier industrial and maritime hub of the Southern Hemisphere, serving as the primary gateway to Antarctica and an essential node in global trade routes while supporting Chile\'s transition to a green hydrogen economy.'}
                    className="text-white leading-relaxed text-lg lg:text-xl"
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Content section - fades in when background appears (11%) */}
            <motion.div
              className="relative"
              style={{
                opacity: contentOpacity,
                y: contentY
              }}
            >
              {/* Title section - fades in when background appears (11%) */}
              <motion.div 
                className="text-center mb-2 relative"
                style={{
                  opacity: titleOpacity,
                  y: titleY
                }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {locale === 'es' ? 'Estructura de Desarrollo de Tierras' : locale === 'zh' ? '土地开发结构' : locale === 'fr' ? 'Structure de Développement des Terres' : 'Land Development Structure'}
                </h2>
                <div className="max-w-3xl mx-auto mb-2">
                  <MagicText 
                    text={locale === 'es'
                      ? 'Desglose completo del desarrollo de tierras en la zona industrial y marítima estratégica de Cabo Negro'
                      : locale === 'zh'
                      ? '卡波内格罗战略工业和海事区土地开发的全面细分'
                      : locale === 'fr'
                      ? 'Répartition complète du développement des terres dans la zone industrielle et maritime stratégique de Cabo Negro'
                      : 'Comprehensive land development breakdown across Cabo Negro\'s strategic industrial and maritime zone'}
                    className="text-gray-300 text-lg"
                  />
                </div>
              </motion.div>

              {/* Total Hectares - Featured */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center p-8 bg-black/50 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl">
                  <div className="text-6xl md:text-7xl font-bold mb-4 text-white">
                    <AnimatedCounter end={300} suffix="+" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium mb-2">
                    {locale === 'es' ? 'Hectáreas Totales' : locale === 'zh' ? '总公顷数' : locale === 'fr' ? 'Hectares Totaux' : 'Total Hectares'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {locale === 'es' ? 'Zona de Desarrollo Industrial y Marítimo' : locale === 'zh' ? '工业和海事开发区' : locale === 'fr' ? 'Zone de Développement Industriel et Maritime' : 'Industrial & Maritime Development Zone'}
                  </p>
                </div>
              </div>

            {/* Company/Area Breakdown */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PPG */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">PPG</h3>
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'es' ? 'Inversiones PPG SpA' : locale === 'zh' ? 'PPG投资公司' : locale === 'fr' ? 'Investissements PPG SpA' : 'Inversiones PPG SpA'}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Solicitud de concesión marítima en trámite' : locale === 'zh' ? '海事特许申请处理中' : locale === 'fr' ? 'Demande de concession maritime en cours' : 'Maritime concession application in process'}
                  </p>
                  <p className="text-blue-400 text-xs font-mono">CM61260</p>
                  <p className="text-gray-400 text-xs mt-3">
                    {locale === 'es' ? 'Desarrollo de zona portuaria con J&P' : locale === 'zh' ? '与J&P合作开发港口区' : locale === 'fr' ? 'Développement de zone portuaire avec J&P' : 'Port zone development with J&P'}
                  </p>
                </div>
              </div>

              {/* Patagon Valley */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">Patagon Valley</h3>
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'es' ? 'Inmobiliaria Patagon Valley SpA' : locale === 'zh' ? '巴塔哥尼亚谷房地产公司' : locale === 'fr' ? 'Immobilier Patagon Valley SpA' : 'Inmobiliaria Patagon Valley SpA'}
                </p>
                <div className="mb-3">
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={33} suffix=" ha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Propiedad de fondo de inversión privado' : locale === 'zh' ? '由私人投资基金拥有' : locale === 'fr' ? 'Propriété d\'un fonds d\'investissement privé' : 'Owned by private investment fund'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Instalado: AWS y GTD' : locale === 'zh' ? '已安装：AWS和GTD' : locale === 'fr' ? 'Installé : AWS et GTD' : 'Installed: AWS and GTD'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    {locale === 'es' ? 'Originalmente planificado como parque tecnológico' : locale === 'zh' ? '最初规划为科技园' : locale === 'fr' ? 'Initialement prévu comme parc technologique' : 'Originally planned as tech park'}
                  </p>
                </div>
              </div>

              {/* A&J */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">A&J</h3>
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'es' ? 'Inversiones A&J Limitada' : locale === 'zh' ? 'A&J投资有限公司' : locale === 'fr' ? 'Investissements A&J Limitée' : 'Inversiones A&J Limitada'}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Lotes subdivididos disponibles' : locale === 'zh' ? '可用的细分地块' : locale === 'fr' ? 'Lots subdivisés disponibles' : 'Subdivided lots available'}
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">5,000 m²+</p>
                  <p className="text-gray-400 text-xs">
                    {locale === 'es' ? 'Tamaño mínimo de lote' : locale === 'zh' ? '最小地块面积' : locale === 'fr' ? 'Taille minimale du lot' : 'Minimum lot size'}
                  </p>
                </div>
              </div>

              {/* J&P */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">
                  {locale === 'es' ? 'Zona Portuaria J&P' : locale === 'zh' ? 'J&P港口区' : locale === 'fr' ? 'Zone Portuaire J&P' : 'J&P Port Zone'}
                </h3>
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'es' ? 'Inversiones J&P Limitada' : locale === 'zh' ? 'J&P投资有限公司' : locale === 'fr' ? 'Investissements J&P Limitée' : 'Inversiones J&P Limitada'}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Desarrollo de zona portuaria' : locale === 'zh' ? '港口区开发' : locale === 'fr' ? 'Développement de zone portuaire' : 'Port zone development'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Vinculado al proyecto portuario PPG' : locale === 'zh' ? '与PPG港口项目相关' : locale === 'fr' ? 'Lié au projet portuaire PPG' : 'Linked to PPG port project'}
                  </p>
                  <p className="text-gray-400 text-xs mt-3">
                    {locale === 'es' ? 'Dividido en sociedades separadas:' : locale === 'zh' ? '分为独立公司：' : locale === 'fr' ? 'Divisé en sociétés séparées :' : 'Divided into separate companies:'}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {locale === 'es' ? '• J&P (continuadora) - Desarrollo portuario' : locale === 'zh' ? '• J&P（继续者）- 港口开发' : locale === 'fr' ? '• J&P (continuatrice) - Développement portuaire' : '• J&P (continuadora) - Port development'}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {locale === 'es' ? '• J&P 2 y J&P 3 - Opciones de ampliación' : locale === 'zh' ? '• J&P 2和J&P 3 - 扩展选项' : locale === 'fr' ? '• J&P 2 et J&P 3 - Options d\'expansion' : '• J&P 2 & J&P 3 - Expansion options'}
                  </p>
                </div>
              </div>

              {/* CN2 */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">Cabo Negro Dos</h3>
                <p className="text-gray-400 text-xs mb-3">
                  {locale === 'es' ? 'Inmobiliaria Cabo Negro Dos' : locale === 'zh' ? '卡波内格罗二号房地产公司' : locale === 'fr' ? 'Immobilier Cabo Negro Dos' : 'Inmobiliaria Cabo Negro Dos'}
                </p>
                <div className="mb-3">
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={173} suffix=" ha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">
                    {locale === 'es' ? 'Resultante de la subdivisión de J&P' : locale === 'zh' ? '来自J&P细分' : locale === 'fr' ? 'Résultant de la subdivision de J&P' : 'Resulting from J&P subdivision'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {locale === 'es' ? 'Área única unificada (sin subdivisión)' : locale === 'zh' ? '单一统一区域（无细分）' : locale === 'fr' ? 'Zone unique unifiée (sans subdivision)' : 'Single unified area (no subdivision)'}
                  </p>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Background image layer - fades in based on scroll with zoom effect */}
        <motion.div
          className="fixed inset-0 z-[8]"
          style={{
            backgroundImage: 'url(/cabonegro_wirefram2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity,
            scale: backgroundScale
          }}
        />
        
        {/* Black overlay that increases as we scroll - only visible when Stats section is active */}
        <motion.div 
          className="fixed inset-0 z-[8] pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: blackOverlayOpacity
          }}
        />
        
        {/* White overlay - fades in when Partners starts reaching top */}
        <motion.div 
          className="fixed inset-0 z-[9]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 1)',
            opacity: whiteOverlayOpacity
          }}
        />
      </section>
    </>
  )
}