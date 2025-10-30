import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function HeroZh() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Trigger hero animations after preloader fade out
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200) // Small delay to ensure smooth transition from preloader
    
    return () => clearTimeout(timer)
  }, [])

  const handleExploreTerrain = () => {
    // Show PreloaderB first BEFORE any other actions
    showPreloaderB()
    
    // Use requestAnimationFrame to ensure state update is processed
    requestAnimationFrame(() => {
      startFadeOut()
      
      // Navigate after PreloaderB has time to display (2.5 seconds)
      setTimeout(() => {
        router.push('/zh/explore')
      }, 2500)
    })
  }

  const handleClick = (event: React.MouseEvent) => {
    // Click handler for future interactive features
    // Currently just tracks click coordinates for potential use
  }

  return (
    <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center overflow-hidden bg-black" style={{ touchAction: 'pan-y' }}>
      {/* Black background */}
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* Background Spline Scene - Glowing Planet Particles */}
      <div 
        className="absolute inset-0 z-1 overflow-hidden"
        onClick={handleClick}
      >
        <iframe 
          src='https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="w-full h-full"
          onLoad={() => {
            setBackgroundLoaded(true)
          }}
          style={{ 
            border: 'none',
            background: 'transparent',
            transform: 'scale(1.3)',
            transformOrigin: 'center center',
            pointerEvents: 'auto'
          }}
          title="3D Background Scene"
        />
      </div>

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 z-2 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Main Title */}
          <div className="space-y-4">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-white leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            >
              卡波内格罗
            </motion.h1>
            
            <motion.div
              className="text-xl md:text-2xl text-gray-300 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              智利南部的战略工业门户
            </motion.div>
          </div>

          {/* Description */}
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            探索麦哲伦地区最具战略意义的工业发展机会，连接太平洋和大西洋的独特地理位置
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="pt-8"
          >
            <Button 
              onClick={handleExploreTerrain}
              className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              探索地形
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
