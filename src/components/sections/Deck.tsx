'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Download, Share2 } from 'lucide-react'

export default function Deck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  return (
    <div className={`min-h-screen bg-black text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Cabo Negro Project Deck</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/10"
              >
                {isFullscreen ? <X className="w-4 h-4" /> : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-6">
          {/* Slide Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="text-center p-12">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h2>
                  <h3 className="text-xl md:text-2xl text-gray-300 mb-6">
                    {slides[currentSlide].subtitle}
                  </h3>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    {slides[currentSlide].content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center gap-4 mt-8">
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
          <div className="text-center mt-6 text-gray-400">
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
