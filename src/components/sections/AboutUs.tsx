'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MagicText } from '@/components/ui/magic-text'

export default function AboutUs() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section 
      ref={sectionRef}
      className="relative pt-12 pb-24 px-6 overflow-hidden bg-black"
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="max-w-3xl mx-auto">
            <MagicText 
              text="Cabo Negro represents a visionary industrial and maritime development at the southernmost tip of Chile, designed to serve as the strategic gateway for Chile's green hydrogen economy and international trade routes."
              className="text-lg sm:text-xl text-gray-400 text-center"
            />
          </div>
        </div>

        {/* Vision */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Our Vision
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              To establish Cabo Negro as the premier industrial and maritime hub 
              of the Southern Hemisphere, serving as the primary gateway to 
              Antarctica and an essential node in global trade routes while 
              supporting Chile's transition to a green hydrogen economy.
            </p>
          </div>
        </motion.div>
        
        {/* Stakeholder signatures image */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/signatures.png"
            alt="Stakeholder signatures"
            width={820}
            height={240}
            className="w-full max-w-3xl h-auto object-contain"
            priority={false}
          />
        </motion.div>
      </div>
    </section>
  )
}
