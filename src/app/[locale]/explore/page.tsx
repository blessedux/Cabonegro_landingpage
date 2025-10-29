'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'

// Spline scenes data
const splineScenes = [
  {
    id: 1,
    url: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/',
    title: 'Cabo Negro 3D Scene 1'
  },
  {
    id: 2,
    url: 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/',
    title: 'Cabo Negro 3D Scene 2'
  },
  {
    id: 3,
    url: 'https://my.spline.design/untitled-xQaQrL119lWxxAC25cYW2IRM/',
    title: 'Cabo Negro 3D Scene 3'
  }
]

function ExploreContent() {
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [splineLoadedStates, setSplineLoadedStates] = useState<Record<number, boolean>>({})
  const [splineErrorStates, setSplineErrorStates] = useState<Record<number, boolean>>({})
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  // Immediately set preloader complete to ensure navbar shows on explore page
  useEffect(() => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    setPreloaderFadeComplete(true)
  }, [setPreloaderComplete, setPreloaderVisible])

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    
    // Wait for preloader fade to complete before showing main content
    setTimeout(() => {
      setPreloaderFadeComplete(true)
    }, 1000) // Match the preloader fade duration
  }

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % splineScenes.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + splineScenes.length) % splineScenes.length)
  }, [])

  const handleSplineLoad = (id: number) => {
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
      {/* Simplified version - bypass preloader for reliability */}
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <Navbar />
          
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
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-green-900/ Bake">
                            <div className="text-center p-8">
                              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-producedH6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold mb-2">3D Experience Unavailable</h3>
                              <p className="text-gray-400 text-sm mb-4">
                                The interactive 3D scene couldn't be loaded. Please try refreshing the page.
                              </p>
                              <button 
                                onClick={() => {
                                  setSplineErrorStates((prev) => ({ ...prev, [scene.id]: false }))
                                  setSplineLoadedStates((prev) => ({ ...prev, [scene.id]: false }))
                                }}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                              >
                                Retry
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Loading overlay */}
                        {!isLoaded && !hasError && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl sm:rounded-2xl">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
                              <p className="text-white/80 text-sm sm:text-base">Loading 3D Experience...</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Navigation Chevrons */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-6 z-10">
                  <button
                    onClick={prevSlide}
                    className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {splineScenes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-white w-8' 
                            : 'bg-white/30 hover:bg-white/50 w-2'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner />
        </div>
    </>
  )
}

export default function ExplorePage() {
  return <ExploreContent />
}
