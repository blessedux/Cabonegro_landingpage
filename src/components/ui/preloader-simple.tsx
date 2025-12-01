'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface PreloaderSimpleProps {
  onComplete?: () => void
  duration?: number
  className?: string
}

export default function PreloaderSimple({ 
  onComplete, 
  duration = 1.5, 
  className = '' 
}: PreloaderSimpleProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Auto-fade after duration
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
      
      // Complete after fade out
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 500) // 500ms fade out duration
    }, duration * 1000)

    return () => clearTimeout(fadeOutTimer)
  }, [duration, onComplete])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="preloader-simple"
          initial={{ opacity: 0 }}
          animate={isFadingOut ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: isFadingOut ? 0.5 : 0.4, // Smooth fade in/out
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center ${className}`}
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Centered black logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isFadingOut ? { 
              opacity: 0,
              scale: 0.95
            } : { 
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              opacity: 0,
              scale: 0.95
            }}
            transition={{ 
              duration: isFadingOut ? 0.5 : 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="relative"
          >
            <div className="flex items-center justify-center">
              <Image
                src="/cabonegro_logo.png"
                alt="Cabo Negro"
                width={200}
                height={200}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
                style={{ 
                  filter: 'brightness(0)', // Convert to black
                }}
                priority
                quality={100}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
