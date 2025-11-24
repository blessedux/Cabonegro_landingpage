'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'

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
      { threshold: 0.3 }
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
  const triggerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress - Stats trigger starts when AboutUs section ends
  const { scrollYProgress } = useScroll({
    target: triggerRef,
    offset: ["start end", "end start"]
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

  // Background fade in - fixed to viewport
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])
  
  // Black overlay opacity - increases as we scroll
  const blackOverlayOpacity = useTransform(scrollYProgress, [0, 0.4], [0.5, 1])
  
  // Title fade in - starts as soon as background starts fading in
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.1, 0.3], [150, 150, 0])
  
  // Content fade in - starts right after title begins, aligned with background
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 0, 1])
  const contentY = useTransform(scrollYProgress, [0, 0.15, 1], [200, 200, -100])
  
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
      {/* Trigger element for scroll tracking */}
      <div ref={triggerRef} className="h-screen" />
      
      {/* Stats section - fixed to viewport, background fades in */}
      <section 
        ref={statsRef} 
        className="fixed top-0 left-0 right-0 h-screen py-20 px-6 overflow-hidden z-[10] pointer-events-none"
      >
        {/* Background image layer - fades in based on scroll */}
        <motion.div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: 'url(/cabonegro_wirefram2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity
          }}
        />
        
        {/* Black overlay that increases as we scroll */}
        <motion.div 
          className="absolute inset-0 z-[2]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: blackOverlayOpacity
          }}
        />
        
        {/* White overlay - fades in when Partners starts reaching top */}
        <motion.div 
          className="absolute inset-0 z-[4]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 1)',
            opacity: whiteOverlayOpacity
          }}
        />
        
        {/* Content container */}
        <div
          className="container mx-auto relative z-[5] h-full flex flex-col justify-center"
          style={{
            pointerEvents: shouldBlockPointer ? 'auto' : 'none'
          }}
        >
            {/* Content section - appears after title */}
            <motion.div
              style={{
                opacity: contentOpacity,
                y: contentY
              }}
            >
              {/* Title section - appears first, positioned right above the 300 card */}
              <motion.div 
                className="text-center mb-2"
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
              <div className="max-w-4xl mx-auto mb-16">
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
      </section>
      
      {/* Spacer to push next section */}
      <div className="h-[200vh]" />
    </>
  )
}