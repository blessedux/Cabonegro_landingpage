'use client'

import { useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Hero from '@/components/sections/Hero'
import AboutUs from '@/components/sections/AboutUs'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats'
import { CaboNegroRulerCarousel } from '@/components/sections/RulerCarousel'
import Partners from '@/components/sections/Partners'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'

// Import messages for English locale
import enMessages from '../../../messages/en.json'

const messages = enMessages as any

function HomeContent() {
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete, isPreloaderBVisible } = usePreloader()

  // Preload critical assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Preload Spline scene
        const splineLink = document.createElement('link')
        splineLink.rel = 'preload'
        splineLink.href = 'https://my.spline.design/glowingplanetparticles-h1I1avgdDrha1naKidHdQVwA/'
        splineLink.as = 'document'
        document.head.appendChild(splineLink)

        // Preload critical fonts
        const fontLink = document.createElement('link')
        fontLink.rel = 'preload'
        fontLink.href = '/_next/static/media/83afe278b6a6bb3c-s.p.3a6ba036.woff2'
        fontLink.as = 'font'
        fontLink.type = 'font/woff2'
        fontLink.crossOrigin = 'anonymous'
        document.head.appendChild(fontLink)

        // Preload critical images (if any)
        // Add any other critical assets here

        // Mark assets as preloaded
        setAssetsPreloaded(true)
      } catch (error) {
        console.warn('Asset preloading failed:', error)
        setAssetsPreloaded(true) // Continue anyway
      }
    }

    preloadAssets()
  }, [])

  // Handle preloader visibility logic
  useEffect(() => {
    // If PreloaderB is active, don't show main preloader
    if (isPreloaderBVisible) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      return
    }
    
    // If preloader is explicitly visible (e.g., language change), wait for it to complete
    if (isPreloaderVisible) {
      setPreloaderFadeComplete(false)
      return
    }
    
    // If user has seen preloader before and no preloader is active, show content immediately
    if (hasSeenPreloader && !isPreloaderVisible) {
      setPreloaderFadeComplete(true)
    }
  }, [hasSeenPreloader, isPreloaderBVisible, isPreloaderVisible, setPreloaderVisible])

  // Handle hash navigation (e.g., #FAQ) after page content is loaded
  useEffect(() => {
    if (preloaderFadeComplete && typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        // Wait a bit for the DOM to fully render
        const timer = setTimeout(() => {
          const element = document.getElementById(hash.substring(1))
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [preloaderFadeComplete])

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
      {/* Preloader - Only show if PreloaderB is not active (don't show when navigating from explore/deck) */}
      {isPreloaderVisible && !isPreloaderBVisible && (
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
          
          {/* Main Sections */}
          <main>
            <Hero />
            <AboutUs />
            <Features />
            <Stats />
            <CaboNegroRulerCarousel />
            <Partners />
            <FAQ />
          </main>

          {/* Footer */}
          <Footer />

          {/* Cookie Banner */}
          <CookieBanner />
        </div>
      )}
    </>
  )
}

export default function EnglishHome() {
  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <HomeContent />
    </NextIntlClientProvider>
  )
}