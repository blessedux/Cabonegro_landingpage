'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Footer from '@/components/sections/Footer'
import NavbarZh from '@/components/sections/Navbar-zh'
import CookieBanner from '@/components/sections/CookieBanner'
import { CaboNegroRulerCarousel } from '@/components/sections/RulerCarousel'

// Spline scenes data
const splineScenes = [
  {
    id: 1,
    url: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/',
    title: '卡波内格罗3D场景1'
  },
  {
    id: 2,
    url: 'https://my.spline.design/untitledcopy-hgQ9E6T0cuMuR3COTVFVso6a/',
    title: '卡波内格罗3D场景2'
  },
  {
    id: 3,
    url: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/',
    title: '卡波内格罗3D场景3'
  }
]

function ExploreContent() {
  const [contentVisible, setContentVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [splineLoadedStates, setSplineLoadedStates] = useState<Record<number, boolean>>({})
  const [splineErrorStates, setSplineErrorStates] = useState<Record<number, boolean>>({})
  const { isFadingOut } = useAnimation()
  const { isPreloaderBVisible, setPreloaderComplete, setPreloaderVisible } = usePreloader()

  // Wait for PreloaderB to complete before showing content
  useEffect(() => {
    // Set preloader complete immediately for navbar visibility
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    
    // If PreloaderB is visible, hide content and wait for it to complete
    if (isPreloaderBVisible) {
      setContentVisible(false)
      return
    }
    
    // PreloaderB is not visible (completed or never shown) - show content
    // Add a small delay for smooth transition after PreloaderB fades out
    const timer = setTimeout(() => {
      setContentVisible(true)
    }, 200) // Slightly longer delay to ensure PreloaderB fade is complete
    return () => clearTimeout(timer)
  }, [isPreloaderBVisible, setPreloaderComplete, setPreloaderVisible])
  
  // Additional safety: if content isn't visible after PreloaderB completes, force show it
  useEffect(() => {
    if (!isPreloaderBVisible && !contentVisible) {
      // PreloaderB just finished, wait a bit then show content
      const safetyTimer = setTimeout(() => {
        console.log('⚠️ Safety: showing explore content after PreloaderB completion')
        setContentVisible(true)
      }, 500) // Wait 500ms after PreloaderB hides to ensure fade is complete
      
      return () => clearTimeout(safetyTimer)
    }
  }, [isPreloaderBVisible, contentVisible])

  // Fallback: Show content after maximum wait time (in case PreloaderB never shows or completes)
  useEffect(() => {
    const maxWaitTimer = setTimeout(() => {
      if (!contentVisible) {
        console.log('⚠️ Max wait timer: forcing explore content to show')
        setContentVisible(true)
      }
    }, 3500) // Max 3.5 seconds (2s PreloaderB + 1s fade + 500ms buffer)
    
    return () => clearTimeout(maxWaitTimer)
  }, [contentVisible])

  const nextSlide = useCallback(() => {
    const nextIndex = (currentSlide + 1) % splineScenes.length
    const sceneId = splineScenes[nextIndex].id
    setSplineLoadedStates((prev) => ({ ...prev, [sceneId]: false }))
    setCurrentSlide(nextIndex)
  }, [currentSlide])

  const prevSlide = useCallback(() => {
    const prevIndex = (currentSlide - 1 + splineScenes.length) % splineScenes.length
    const sceneId = splineScenes[prevIndex].id
    setSplineLoadedStates((prev) => ({ ...prev, [sceneId]: false }))
    setCurrentSlide(prevIndex)
  }, [currentSlide])

  const handleSplineLoad = (id: number) => {
    // Load immediately - no delay for scene switches
    setSplineLoadedStates((prev) => ({ ...prev, [id]: true }))
  }

  const handleSplineError = (id: number) => {
    setSplineErrorStates((prev) => ({ ...prev, [id]: true }))
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [prevSlide, nextSlide])

  return (
    <>
      {/* Only show content after PreloaderB completes */}
      {contentVisible && (
        <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <NavbarZh />
          
          {/* Main Content - Spline Scene Gallery */}
          <main className="pt-32 pb-32 px-6">
            <div className="container mx-auto">
              {/* Spline Scene Gallery Container */}
              <div className="relative w-full h-[80vh] min-h-[600px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                <AnimatePresence mode="wait">
                  {splineScenes.map((scene, index) => {
                    if (index !== currentSlide) return null
                    const isLoaded = splineLoadedStates[scene.id] || false
                    const hasError = splineErrorStates[scene.id] || false

                    return (
                      <motion.div
                        key={scene.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        {!hasError ? (
                          <div className="w-full h-full overflow-hidden rounded-xl sm:rounded-2xl">
                            <iframe 
                              src={scene.url}
                              frameBorder="0" 
                              width="100%" 
                              height="100%"
                              className="w-full h-full"
                              style={{
                                transform: 'scale(1.4)',
                                transformOrigin: 'center center',
                                width: '100%',
                                height: '100%'
                              }}
                              title={scene.title}
                              loading="lazy"
                              allow="fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
                              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                              onLoad={() => handleSplineLoad(scene.id)}
                              onError={() => handleSplineError(scene.id)}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/20">
                            <div className="text-center p-8">
                              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold mb-2">3D体验不可用</h3>
                              <p className="text-gray-400 text-sm mb-4">
                                交互式3D场景无法加载。请刷新页面重试。
                              </p>
                              <button 
                                onClick={() => {
                                  setSplineErrorStates((prev) => ({ ...prev, [scene.id]: false }))
                                  setSplineLoadedStates((prev) => ({ ...prev, [scene.id]: false }))
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                              >
                                重试
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Loading overlay - Crane image with fade */}
                        {!isLoaded && !hasError && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl sm:rounded-2xl"
                          >
                            <img
                              src="/BNWCRANE_preloaderB.png"
                              alt="加载中"
                              className="h-20 sm:h-24 w-auto opacity-80 animate-pulse"
                            />
                          </motion.div>
                        )}

                        {/* 交互提示 */}
                        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-[5] px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-xs text-white/80">
                          拖动旋转 • 滚动缩放
                        </div>

                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Navigation Chevrons */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-6 z-10">
                  <button
                    onClick={prevSlide}
                    className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="上一张"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {splineScenes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const sceneId = splineScenes[index].id
                          setSplineLoadedStates((prev) => ({ ...prev, [sceneId]: false }))
                          setCurrentSlide(index)
                        }}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-white w-8' 
                            : 'bg-white/30 hover:bg-white/50 w-2'
                        }`}
                        aria-label={`转到幻灯片 ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="下一张"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Ruler Carousel */}
          <CaboNegroRulerCarousel />

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner />
        </div>
      )}
    </>
  )
}

export default function ChineseExplore() {
  return <ExploreContent />
}
