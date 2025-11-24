'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { MagicText } from '@/components/ui/magic-text'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'

export default function AboutUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress - AboutUs trigger starts when hero section ends
  const { scrollYProgress } = useScroll({
    target: triggerRef,
    offset: ["start end", "end start"]
  })

  // AboutUs content fades in as Hero fades out (starts at 0.2, fully visible at 0.6)
  // Then fades out as Stats appears (starts fading at 0.7, fully faded at 0.9)
  const aboutUsOpacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.7, 0.9], [0, 0, 1, 1, 0])
  const aboutUsY = useTransform(scrollYProgress, [0, 0.2, 0.6], [30, 30, 0])

  // Title fades in slightly before main content (starts at 0.2, fully visible at 0.5)
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [0, 0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.2, 0.5], [20, 20, 0])

  // Track opacity to conditionally enable pointer events
  const [shouldBlockPointer, setShouldBlockPointer] = useState(false)
  
  useMotionValueEvent(aboutUsOpacity, "change", (latest) => {
    // Only block pointer events when opacity is above 0.1 (visible enough)
    setShouldBlockPointer(latest > 0.1)
  })

  return (
    <>
      {/* Spacer to ensure 80vh scroll before trigger */}
      <div className="h-[80vh]" />
      
      {/* Trigger element for scroll tracking */}
      <div ref={triggerRef} className="h-screen" />
      
      {/* AboutUs section - overlays on hero video */}
      <section 
        ref={sectionRef}
        className="fixed top-0 left-0 right-0 h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden z-[9] pointer-events-none"
        style={{
          backgroundColor: 'transparent'
        }}
      >
        {/* Content container - aligned to right on desktop */}
        <motion.div 
          className="container mx-auto max-w-7xl relative z-10 h-full flex flex-col justify-center"
          style={{
            opacity: aboutUsOpacity,
            y: aboutUsY,
            pointerEvents: shouldBlockPointer ? 'auto' : 'none'
          }}
        >
          <div className="w-full flex flex-col lg:items-end lg:pr-8 xl:pr-16">
            {/* Title - replaces hero title - aligned right on desktop */}
            <motion.div
              className="mb-12 w-full lg:w-auto lg:text-right"
              style={{
                opacity: titleOpacity,
                y: titleY
              }}
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-left lg:text-right text-white">
                <BlurTextAnimation 
                  text="About Cabo Negro"
                  fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                  textColor="text-white"
                  animationDelay={0}
                />
              </h2>
            </motion.div>

            {/* Main content - aligned right on desktop */}
            <div className="mb-12 w-full lg:w-auto lg:max-w-2xl lg:text-right">
              <MagicText 
                text="Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile's green hydrogen economy and international trade routes."
                className="text-lg sm:text-xl text-white text-left lg:text-right leading-relaxed"
              />
            </div>
          </div>

          {/* Vision - centered and as wide as possible */}
          <div className="w-full max-w-6xl mx-auto mt-8 lg:mt-12">
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-white">
                Our Vision
              </h3>
              <p className="text-white leading-relaxed text-lg lg:text-xl max-w-5xl mx-auto px-4">
                To establish Cabo Negro as the premier industrial and maritime hub 
                of the Southern Hemisphere, serving as the primary gateway to 
                Antarctica and an essential node in global trade routes while 
                supporting Chile's transition to a green hydrogen economy.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Spacer to push next section */}
      <div className="h-screen" />
    </>
  )
}
