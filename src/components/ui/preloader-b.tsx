'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { gsap } from 'gsap'

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
  const logoRef = useRef<HTMLDivElement>(null)
  const brightnessAnimationRef = useRef<gsap.core.Tween | null>(null)

  // Reset state when component mounts or becomes visible again
  useEffect(() => {
    console.log('🟡 PreloaderB mounted/remounted')
    setIsVisible(true)
    setIsFadingOut(false)
    mountTimeRef.current = Date.now()
  }, [])

  // Brightness pingpong animation
  useEffect(() => {
    if (!logoRef.current || isFadingOut) return

    // Create pingpong brightness animation
    brightnessAnimationRef.current = gsap.to(logoRef.current, {
      filter: 'brightness(1.5)',
      duration: 0.8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      if (brightnessAnimationRef.current) {
        brightnessAnimationRef.current.kill()
      }
    }
  }, [isFadingOut])

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
      
      // Stop brightness animation on fade out
      if (brightnessAnimationRef.current) {
        brightnessAnimationRef.current.kill()
      }
      
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
          className={`${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[99999]'} bg-white flex items-center justify-center ${className}`}
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Centered logo with brightness animation - Works on both mobile and desktop */}
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
            <div 
              ref={logoRef}
              className="flex items-center justify-center"
              style={{ filter: 'brightness(1)' }}
            >
              <Image
                src="/cabonegro_logo.png"
                alt="Cabo Negro"
                width={200}
                height={200}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
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
