'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Download, Share2 } from 'lucide-react'

export default function Deck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const slideRef = useRef<HTMLDivElement>(null)

  const slides = [
    {
      id: 1,
      title: "Cabo Negro Industrial Complex",
      subtitle: "Strategic Industrial & Maritime Hub",
      content: "Gateway to the South of the World",
      image: "/api/placeholder/800/600"
    },
    {
      id: 2,
      title: "Technical Specifications",
      subtitle: "Infrastructure & Capacity",
      content: "State-of-the-art industrial facilities with cutting-edge technology and sustainable infrastructure",
      image: "/api/placeholder/800/600"
    },
    {
      id: 3,
      title: "Regulatory Compliance",
      subtitle: "International Standards",
      content: "Full compliance with international maritime, environmental, and industrial regulations",
      image: "/api/placeholder/800/600"
    },
    {
      id: 4,
      title: "Environmental Impact",
      subtitle: "Sustainable Development",
      content: "Comprehensive environmental assessments and sustainable development practices",
      image: "/api/placeholder/800/600"
    },
    {
      id: 5,
      title: "Investment Opportunities",
      subtitle: "Strategic Partnerships",
      content: "Exclusive investment opportunities in the Southern Hemisphere's premier industrial hub",
      image: "/api/placeholder/800/600"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Touch handling for mobile swiping
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }
  }

  return (
    <div className={`min-h-screen bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-white hover:bg-white/10 p-2"
              >
                <ChevronLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <h1 className="text-lg md:text-xl font-bold truncate">
                {isMobile ? 'Cabo Negro Deck' : 'Cabo Negro Project Deck'}
              </h1>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Share</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Download</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10 p-2"
              >
                {isFullscreen ? <X className="w-4 h-4" /> : <span className="text-sm">⛶</span>}
                <span className="hidden md:inline ml-2">Fullscreen</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20 pb-16 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Slide Navigation */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content - Touch Enabled */}
          <div 
            ref={slideRef}
            className="max-w-6xl mx-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="bg-white/5 rounded-xl md:rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] md:aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="text-center p-6 md:p-12">
                  <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <h3 className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-4 md:mb-6">
                    {slides[currentSlide].subtitle}
                  </h3>
                  <p className="text-sm md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {slides[currentSlide].content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Swipe Instructions */}
          {isMobile && (
            <div className="text-center mt-4 text-gray-500 text-sm">
              Swipe left or right to navigate
            </div>
          )}

          {/* Navigation Controls - Hidden on Mobile */}
          <div className="hidden md:flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="border-white text-white hover:bg-white hover:text-black"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4 md:mt-6 text-gray-400 text-sm md:text-base">
            {currentSlide + 1} of {slides.length}
          </div>
        </div>
      </main>

      {/* Keyboard Navigation */}
      <div className="hidden">
        <button onClick={prevSlide} onKeyDown={(e) => e.key === 'ArrowLeft' && prevSlide()}>
          Left Arrow
        </button>
        <button onClick={nextSlide} onKeyDown={(e) => e.key === 'ArrowRight' && nextSlide()}>
          Right Arrow
        </button>
      </div>
    </div>
  )
}
