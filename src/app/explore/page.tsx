'use client'

import { useState, useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'

function ExploreContent() {
  const [showCookieBanner, setShowCookieBanner] = useState(true)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  // If user has seen preloader before, skip it and show content immediately
  useEffect(() => {
    if (hasSeenPreloader) {
      setPreloaderFadeComplete(true)
    }
  }, [hasSeenPreloader])

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    
    // Wait for preloader fade to complete before showing main content
    setTimeout(() => {
      setPreloaderFadeComplete(true)
    }, 1000) // Match the preloader fade duration
  }

  return (
    <>
      {/* Preloader - Always shows first */}
      {isPreloaderVisible && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          duration={6}
        />
      )}

      {/* Main Content - Only shows after preloader fade completes */}
      {preloaderFadeComplete && (
        <div className={`min-h-screen bg-black text-white transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          {/* Navigation */}
          <Navbar />
          
          {/* Main Content - Empty for now */}
          <main className="pt-32 pb-20 px-6">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Explore
              </h1>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                This page is under construction. Content will be added soon.
              </p>
            </div>
          </main>

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner 
            showCookieBanner={showCookieBanner} 
            setShowCookieBanner={setShowCookieBanner} 
          />
        </div>
      )}
    </>
  )
}

export default function ExplorePage() {
  return <ExploreContent />
}
