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
  { name: "Armada", id: 3, src: "/logos/Armada_white.png", alt: "Armada Logo" },
  { name: "CORFO", id: 4, src: "/logos/Logo_Corfo_white.png", alt: "CORFO Logo" },
  { name: "H2 Chile", id: 5, src: "/logos/MARCA-H2CHILE-white.png", alt: "H2 Chile Logo" },
  { name: "Patagon", id: 6, src: "/logos/patagon_white.png", alt: "Patagon Logo" },
  { name: "UMAG", id: 7, src: "/logos/umag_logo.png", alt: "UMAG Logo" },
  { name: "YLMV", id: 8, src: "/logos/ylmv_blanco.png", alt: "YLMV Logo" },
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