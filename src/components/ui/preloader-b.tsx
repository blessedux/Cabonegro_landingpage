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
    console.log('🟡 PreloaderB mounted/remounted')
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
      }, 400) // Faster fade out (400ms) for quicker navigation
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
            duration: isFadingOut ? 1.0 : 0.3, // Fast fade in (0.3s)
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} bg-black ${className}`}
          style={{ backgroundColor: '#000000' }}
        >
          {/* Image on Right Side - Desktop Only - Absolute Positioned */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 opacity-100">
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
                duration: isFadingOut ? 1.0 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <Image
                src="/BNWCRANE_preloaderB.png"
                alt="Cabo Negro Industrial Infrastructure"
                width={400}
                height={400}
                className="max-h-[300px] w-auto object-contain"
                priority
                quality={100}
              />
            </motion.div>
          </div>
          
          {/* Centered content for mobile */}
          <div className="lg:hidden flex items-center justify-center h-full">
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
                duration: isFadingOut ? 1.0 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="relative"
            >
              <Image
                src="/BNWCRANE_preloaderB.png"
                alt="Cabo Negro Preloader"
                width={400}
                height={400}
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
                priority
                quality={100}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
