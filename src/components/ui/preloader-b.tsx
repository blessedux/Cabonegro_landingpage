'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
}

export default function PreloaderB({ onComplete, duration = 1.5, className = '' }: PreloaderBProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Start fade out after duration
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
      
      // Complete after fade out
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 800) // 0.8s fade out duration
    }, duration * 1000)

    return () => clearTimeout(fadeOutTimer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[60] bg-black flex items-center justify-center ${className}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.1,
              ease: 'easeOut'
            }}
            className="relative"
          >
            <Image
              src="/BNWCRANE_preloaderB.png"
              alt="Cabo Negro Preloader"
              width={400}
              height={400}
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

