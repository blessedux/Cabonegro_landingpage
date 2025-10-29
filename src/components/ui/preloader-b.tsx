'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
  inline?: boolean // If true, uses absolute positioning instead of fixed
}

export default function PreloaderB({ onComplete, duration = 1.5, className = '', inline = false }: PreloaderBProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const mountTimeRef = useRef<number>(Date.now())

  // Reset state when component mounts or becomes visible again
  useEffect(() => {
    setIsVisible(true)
    setIsFadingOut(false)
    mountTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    // For inline mode, ensure minimum 2 seconds of visibility before allowing fade out
    if (inline) {
      const minDisplayTime = 2000 // 2 seconds minimum
      const elapsed = Date.now() - mountTimeRef.current
      const remainingTime = Math.max(0, minDisplayTime - elapsed)
      
      // After minimum time passes, component can be removed by parent
      // The fade out is handled by Framer Motion exit animation
      return
    }
    
    // For full-screen mode, auto-fade after duration with smooth transition
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true)
      
      // Complete after fade out
      setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 1000) // 1s fade out duration for smooth transition
    }, duration * 1000)

    return () => clearTimeout(fadeOutTimer)
  }, [duration, onComplete, inline])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="preloader-b"
          initial={{ opacity: 0 }}
          animate={isFadingOut ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: isFadingOut ? 1.0 : 1.0, 
            ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth fade
          }}
          className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[9999]'} bg-black flex items-center justify-center ${className}`}
          style={{ backgroundColor: '#000000' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isFadingOut ? { 
              opacity: 0
            } : { 
              opacity: 1
            }}
            exit={{ 
              opacity: 0
            }}
            transition={{ 
              duration: isFadingOut ? 1.0 : 1.0,
              ease: [0.25, 0.46, 0.45, 0.94] // Smooth cubic bezier easing
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
              quality={100}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
