'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { GradientHeading } from '@/components/ui/gradient-heading'
import { MagicText } from '@/components/ui/magic-text'
import Image from 'next/image'

// Define the logos from your public/logos directory
const partnerLogos = [
  { 
    name: "Cabo Negro", 
    id: 1, 
    src: "/logos/cabonegro_logo.png", 
    alt: "Cabo Negro Logo",
    description: "Strategic industrial and maritime development hub in Chile's southern region"
  },
  { 
    name: "Amazon", 
    id: 2, 
    src: "/logos/Amazon_white.png", 
    alt: "Amazon Logo",
    description: "Technology and cloud infrastructure partner supporting digital transformation"
  },
  { 
    name: "Armada", 
    id: 3, 
    src: "/logos/Armada_white.png", 
    alt: "Armada Logo",
    description: "Chilean Navy providing maritime security and naval infrastructure support"
  },
  { 
    name: "CORFO", 
    id: 4, 
    src: "/logos/Logo_Corfo_white.png", 
    alt: "CORFO Logo",
    description: "Chilean Economic Development Agency promoting industrial growth and innovation"
  },
  { 
    name: "H2 Chile", 
    id: 5, 
    src: "/logos/MARCA-H2CHILE-white.png", 
    alt: "H2 Chile Logo",
    description: "Hydrogen industry association advancing Chile's green hydrogen economy"
  },
  { 
    name: "Patagon", 
    id: 6, 
    src: "/logos/patagon_white.png", 
    alt: "Patagon Logo",
    description: "Regional development partner focused on sustainable growth in Patagonia"
  },
  { 
    name: "UMAG", 
    id: 7, 
    src: "/logos/umag_logo.png", 
    alt: "UMAG Logo",
    description: "University of Magallanes providing research and academic collaboration"
  },
  { 
    name: "YLMV", 
    id: 8, 
    src: "/logos/ylmv_blanco.png", 
    alt: "YLMV Logo",
    description: "Strategic investment and development partner"
  },
]

export default function PartnersPage() {
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
    <div className="min-h-screen bg-black text-white">
      <section ref={partnersRef} className="py-20 px-6 relative overflow-hidden">
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

          {/* Partners Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-24 h-16 md:w-32 md:h-20">
                      <Image
                        src={partner.src}
                        alt={partner.alt}
                        fill
                        className="object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {partner.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl border border-white/10 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Join Our Network
              </h3>
              <p className="text-gray-400 mb-6">
                Interested in becoming a strategic partner? Contact us to explore collaboration opportunities.
              </p>
              <a 
                href="/contact"
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
              >
                Get in Touch
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
