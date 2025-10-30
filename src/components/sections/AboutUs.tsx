'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
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
        
        {/* Stakeholder Signatures Placeholders */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-white text-center">
            Project Stakeholders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* J&P Placeholder */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                J&amp;P
              </h4>
              <div
                className="w-full max-w-md aspect-[3/1] rounded-xl border-2 border-dashed border-gray-600 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center"
                aria-label="J&P signature placeholder"
              >
                <span className="text-gray-500">Signature/Image placeholder</span>
              </div>
            </div>

            {/* PPG Placeholder */}
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                PPG
              </h4>
              <div
                className="w-full max-w-md aspect-[3/1] rounded-xl border-2 border-dashed border-gray-600 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center"
                aria-label="PPG signature placeholder"
              >
                <span className="text-gray-500">Signature/Image placeholder</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
