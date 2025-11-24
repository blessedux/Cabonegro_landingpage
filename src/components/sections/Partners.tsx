'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { LogoCarousel } from '@/components/ui/logo-carousel'
import { MagicText } from '@/components/ui/magic-text'

// Define the logos from your public/logos directory
const partnerLogos = [
  { name: "Cabo Negro", id: 1, src: "/logos/cabonegro_logo.png", alt: "Cabo Negro Logo" },
  { name: "Armada", id: 2, src: "/logos/Armada_white.png", alt: "Armada Logo" },
  { name: "CORFO", id: 3, src: "/logos/Logo_Corfo_white.png", alt: "CORFO Logo" },
  { name: "H2 Chile", id: 4, src: "/logos/MARCA-H2CHILE-white.png", alt: "H2 Chile Logo" },
  { name: "Patagon", id: 5, src: "/logos/patagon_white.png", alt: "Patagon Logo" },
  { name: "UMAG", id: 6, src: "/logos/umag_logo.png", alt: "UMAG Logo" },
  { name: "YLMV", id: 7, src: "/logos/ylmv_blanco.png", alt: "YLMV Logo" },
  { name: "GTD", id: 8, src: "/gtd_white_logo.png", alt: "GTD Logo" },
  { name: "Circular", id: 9, src: "/circular_white.png", alt: "Circular Logo" },
]

export default function Partners() {
  const t = useTranslations('partners')
  const partnersRef = useRef(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress - Partners starts later, after Stats
  const { scrollYProgress } = useScroll({
    target: triggerRef,
    offset: ["start end", "end start"]
  })

  // Delay the start of animations - only start when scroll progress reaches 0.6
  // This makes Partners start later in the scroll, allowing more Stats content to be visible
  const adjustedProgress = useTransform(scrollYProgress, [0.6, 1], [0, 1])
  
  const titleY = useTransform(adjustedProgress, [0, 1], [50, -50])
  const titleOpacity = useTransform(adjustedProgress, [0, 0.3, 1], [0, 1, 1])
  const descriptionY = useTransform(adjustedProgress, [0, 1], [30, -30])
  const descriptionOpacity = useTransform(adjustedProgress, [0, 0.2, 1], [0, 1, 1])
  
  // Shadow intensity - static, no parallax movement
  const shadowOpacity = useTransform(adjustedProgress, [0, 0.3, 0.7, 1], [0.3, 0.6, 0.8, 0.5])

  return (
    <>
      {/* Trigger element for scroll tracking - positioned before section */}
      <div ref={triggerRef} className="h-0" />
      <motion.section 
        ref={partnersRef} 
        data-partners-section="true"
        data-white-background="true"
        className="pt-20 pb-20 px-3 md:px-6 relative overflow-visible bg-white rounded-t-[3rem] md:rounded-t-[4rem] -mt-8 relative z-10"
      >
      {/* Enhanced shadow that moves with parallax - creates depth as it slides */}
      <motion.div
        className="absolute -top-12 left-0 right-0 h-16 z-0 pointer-events-none"
        style={{ 
          opacity: shadowOpacity,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1), transparent)',
          filter: 'blur(20px)',
          transform: 'translateY(-50%)'
        }}
      />
      {/* Additional shadow layer for more depth */}
      <motion.div
        className="absolute -top-8 left-0 right-0 h-12 z-0 pointer-events-none"
        style={{ 
          opacity: shadowOpacity,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15), transparent)',
          filter: 'blur(15px)'
        }}
      />
      
      {/* Parallax background layer */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-t-[3rem] md:rounded-t-[4rem]">
        {/* Animated Edge Glows - light mode with accent blue */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
          style={{
            backgroundImage: `radial-gradient(circle 700px at 18% 15%, rgba(54, 95, 148, 0.08), transparent 62%)`,
          }}
        />
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
          style={{
            backgroundImage: `radial-gradient(circle 800px at 82% 85%, rgba(54, 95, 148, 0.06), transparent 68%)`,
          }}
        />

        {/* Subtle textured wall behind lit areas */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(54, 95, 148, 0.02) 0px, rgba(54, 95, 148, 0.02) 2px, transparent 2px, transparent 4px),
              repeating-linear-gradient(90deg, rgba(54, 95, 148, 0.015) 0px, rgba(54, 95, 148, 0.015) 2px, transparent 2px, transparent 4px)
            `,
          }}
        />
      </div>

      <div 
        className="container mx-auto relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mb-2">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight pb-2">
              {t('title')}
            </h3>
          </div>
          
          <div className="mb-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black tracking-tight pb-2">
              {t('subtitle')}
            </h2>
          </div>
          
          <motion.div
            style={{ y: descriptionY, opacity: descriptionOpacity }}
            className="max-w-2xl mx-auto"
          >
            <MagicText 
              text={t('description')}
              className="text-gray-600 text-lg"
            />
          </motion.div>
        </div>

        <div className="flex justify-center mb-0">
          <LogoCarousel columnCount={3} logos={partnerLogos} />
        </div>
      </div>
    </motion.section>
    </>
  )
}