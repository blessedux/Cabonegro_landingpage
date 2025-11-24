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
  const locale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : 'en'
  const buttonText = locale === 'es' ? 'Explorar Terreno' : locale === 'zh' ? '探索地形' : 'Explore Terrain'
  
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
                  Our Vision
                </motion.h3>
                <motion.div
                  style={{ opacity: visionSubtitleOpacity }}
                  className="max-w-5xl mx-auto"
                >
                  <EarlyMagicText 
                    text="To establish Cabo Negro as the premier industrial and maritime hub of the Southern Hemisphere, serving as the primary gateway to Antarctica and an essential node in global trade routes while supporting Chile's transition to a green hydrogen economy."
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
                  Land Development Structure
                </h2>
                <div className="max-w-3xl mx-auto mb-2">
                  <MagicText 
                    text="Comprehensive land development breakdown across Cabo Negro's strategic industrial and maritime zone"
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
                  <p className="text-gray-300 text-lg font-medium mb-2">Total Hectares</p>
                  <p className="text-gray-400 text-sm">Industrial & Maritime Development Zone</p>
                </div>
              </div>

            {/* Company/Area Breakdown */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PPG */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">PPG</h3>
                <p className="text-gray-400 text-xs mb-3">Inversiones PPG SpA</p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Maritime concession application in process</p>
                  <p className="text-blue-400 text-xs font-mono">CM61260</p>
                  <p className="text-gray-400 text-xs mt-3">Port zone development with J&P</p>
                </div>
              </div>

              {/* Patagon Valley */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">Patagon Valley</h3>
                <p className="text-gray-400 text-xs mb-3">Inmobiliaria Patagon Valley SpA</p>
                <div className="mb-3">
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={33} suffix=" ha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Owned by private investment fund</p>
                  <p className="text-gray-300 text-sm">Installed: AWS and GTD</p>
                  <p className="text-gray-400 text-xs mt-2">Originally planned as tech park</p>
                </div>
              </div>

              {/* A&J */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">A&J</h3>
                <p className="text-gray-400 text-xs mb-3">Inversiones A&J Limitada</p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Subdivided lots available</p>
                  <p className="text-2xl font-bold text-white mb-2">5,000 m²+</p>
                  <p className="text-gray-400 text-xs">Minimum lot size</p>
                </div>
              </div>

              {/* J&P */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">J&P Port Zone</h3>
                <p className="text-gray-400 text-xs mb-3">Inversiones J&P Limitada</p>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Port zone development</p>
                  <p className="text-gray-300 text-sm">Linked to PPG port project</p>
                  <p className="text-gray-400 text-xs mt-3">Divided into separate companies:</p>
                  <p className="text-gray-300 text-xs">• J&P (continuadora) - Port development</p>
                  <p className="text-gray-300 text-xs">• J&P 2 & J&P 3 - Expansion options</p>
                </div>
              </div>

              {/* CN2 */}
              <div className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
                <h3 className="text-white font-bold text-lg mb-3">Cabo Negro Dos</h3>
                <p className="text-gray-400 text-xs mb-3">Inmobiliaria Cabo Negro Dos</p>
                <div className="mb-3">
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter end={173} suffix=" ha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Resulting from J&P subdivision</p>
                  <p className="text-gray-400 text-xs">Single unified area (no subdivision)</p>
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