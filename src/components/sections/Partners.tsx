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
  const { scrollYProgress } = useScroll({
    target: partnersRef,
    offset: ["start end", "end start"]
  })

  const titleY = useTransform(scrollYProgress, [0, 1], [50, -50])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const descriptionY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const descriptionOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={partnersRef} className="py-20 px-3 md:px-6 relative overflow-hidden bg-black">
      {/* Animated Edge Glows - brighter, whiter */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: [0, 8, 0], y: [0, -6, 0] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
        style={{
          backgroundImage: `radial-gradient(circle 700px at 18% 15%, rgba(255,255,255,0.18), transparent 62%)`,
        }}
      />
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        style={{
          backgroundImage: `radial-gradient(circle 800px at 82% 85%, rgba(255,255,255,0.14), transparent 68%)`,
        }}
      />

      {/* Subtle textured wall behind lit areas */}
      <div
        className="absolute inset-0 z-0 opacity-35 mix-blend-screen"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 4px)
          `,
          backgroundBlendMode: 'screen',
        }}
      />

      {/* Cross-fade overlay to blend content smoothly */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/70 via-black/25 to-black/80" />

      {/* Edge vignette to ease glow into borders */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(120% 120% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.85) 100%)`,
        }}
      />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            style={{ y: titleY, opacity: titleOpacity }}
            className="mb-4"
          >
            <GradientHeading variant="secondary" size="lg">
              {t('title')}
            </GradientHeading>
          </motion.div>
          
          <motion.div
            style={{ y: titleY, opacity: titleOpacity }}
            className="mb-8"
          >
            <GradientHeading size="xl">
              {t('subtitle')}
            </GradientHeading>
          </motion.div>
          
          <motion.div
            style={{ y: descriptionY, opacity: descriptionOpacity }}
            className="max-w-2xl mx-auto"
          >
            <MagicText 
              text={t('description')}
              className="text-gray-400 text-lg"
            />
          </motion.div>
        </div>

        <div className="flex justify-center">
          <LogoCarousel columnCount={3} logos={partnerLogos} />
        </div>
      </div>
    </section>
  )
}