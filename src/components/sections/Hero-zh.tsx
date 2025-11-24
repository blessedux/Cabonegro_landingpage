import { Button } from '@/components/ui/button'
import BlurTextAnimation from '@/components/ui/BlurTextAnimation'
import Link from 'next/link'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HeroZh() {
  const router = useRouter()
  const { startFadeOut } = useAnimation()
  const { showPreloaderB } = usePreloader()
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const [variantIndex, setVariantIndex] = useState<number>(0)
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

  const variants = [
    { key: 'A', src: 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/', title: '卡波内格罗', subtitle: '智利南部的战略工业门户' },
    { key: 'B', src: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/', title: '卡波内格罗', subtitle: '智利南部的战略工业门户' },
    { key: 'C', src: 'https://my.spline.design/untitledcopy-hgQ9E6T0cuMuR3COTVFVso6a/', title: '卡波内格罗', subtitle: '智利南部的战略工业门户' }
  ]
  const current = variants[variantIndex]
  const nextVariant = () => setVariantIndex((i) => (i + 1) % variants.length)
  const prevVariant = () => setVariantIndex((i) => (i - 1 + variants.length) % variants.length)

  return (
    <section className="fixed top-0 left-0 right-0 h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden bg-black z-0" style={{ touchAction: 'pan-y' }}>
      {/* Black background */}
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* 背景 Spline 场景 - 可切换变体 */}
      <div 
        className="absolute inset-0 z-1 overflow-hidden"
        onClick={handleClick}
      >
        <iframe 
          src={current.src}
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
      
      {/* Bottom fade-to-white gradient for seamless transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-[1] pointer-events-none" />

      {/* 变体切换：左右箭头（3 个背景） */}
      <div className="absolute top-24 right-6 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-2 py-1 rounded-full border border-white/10">
          <button onClick={prevVariant} className="p-1.5 rounded-full hover:bg-white/10 text-white" aria-label="上一个背景">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/80 px-2">{current.key}</span>
          <button onClick={nextVariant} className="p-1.5 rounded-full hover:bg-white/10 text-white" aria-label="下一个背景">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

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
              {current.title}
            </motion.h1>
            
            <motion.div
              className="text-xl md:text-2xl text-gray-300 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              {current.subtitle}
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
