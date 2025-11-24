'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { NextIntlClientProvider } from 'next-intl'
import { PreloaderProvider } from '@/contexts/PreloaderContext'
import { AnimationProvider } from '@/contexts/AnimationContext'
import { CookieBannerProvider } from '@/contexts/CookieBannerContext'
import { ThemeProvider } from 'next-themes'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader-es'
import Hero from '@/components/sections/Hero-es'
import AboutUs from '@/components/sections/AboutUs'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats-es'
import Projects from '@/components/sections/Projects-es'
import Partners from '@/components/sections/Partners-es'
import { WorldMapDemoEs } from '@/components/ui/world-map-demo-es'
import FAQ from '@/components/sections/FAQ-es'
import Footer from '@/components/sections/Footer-es'
import Navbar from '@/components/sections/Navbar-es'
import CookieBanner from '@/components/sections/CookieBanner'

// Import messages for Spanish locale
import esMessages from '../../../messages/es.json'

const messages = esMessages as any

function HomeContent() {
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
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
    // Check if assets are cached
    const assetsCached = localStorage.getItem('cabonegro-assets-cached') === 'true'
    
    // If PreloaderB is active, don't show main preloader
    if (isPreloaderBVisible) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      return
    }
    
    // If assets are cached and user has seen preloader, skip preloader entirely
    if (assetsCached && hasSeenPreloader) {
      setPreloaderVisible(false)
      setPreloaderFadeComplete(true)
      setContentReady(true)
      return
    }
    
    // If preloader is explicitly visible (first visit), wait for it to complete
    if (isPreloaderVisible) {
      setPreloaderFadeComplete(false)
      return
    }
    
    // If user has seen preloader before and no preloader is active, show content immediately
    if (hasSeenPreloader && !isPreloaderVisible) {
      setPreloaderFadeComplete(true)
      setContentReady(true)
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

  // Handle content fade-in animation
  useEffect(() => {
    if (contentReady && contentRef.current) {
      // Start content fade-in animation - faster and smoother
      gsap.fromTo(contentRef.current, 
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 0.8, // Faster fade-in to match preloader fade-out
          ease: 'power2.out',
          delay: 0.1 // Small delay to ensure smooth overlap
        }
      )
    }
  }, [contentReady])

  // Safety fallback: ensure content shows after preloader duration + buffer
  useEffect(() => {
    if (isPreloaderVisible && !isPreloaderBVisible) {
      const safetyTimeout = setTimeout(() => {
        // If preloader is still visible after duration + buffer, force show content
        setPreloaderFadeComplete(true)
        setContentReady(true)
        setPreloaderVisible(false)
        setPreloaderComplete(true)
      }, 7000) // 6s duration + 1s buffer

      return () => clearTimeout(safetyTimeout)
    }
  }, [isPreloaderVisible, isPreloaderBVisible, setPreloaderVisible, setPreloaderComplete])

  const handlePreloaderFadeOutStart = () => {
    // Pre-render content when preloader starts fading out
    setContentReady(true)
    setPreloaderFadeComplete(true)
  }

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    // Ensure content is shown when preloader completes
    setPreloaderFadeComplete(true)
    setContentReady(true)
  }

  return (
    <>
      {/* Preloader - Only show if PreloaderB is not active (don't show when navigating from explore/deck) */}
      {isPreloaderVisible && !isPreloaderBVisible && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          onFadeOutStart={handlePreloaderFadeOutStart}
          duration={6}
        />
      )}

      {/* Main Content - Pre-render but hidden, fade in when ready */}
      {preloaderFadeComplete && (
        <div 
          ref={contentRef}
          className={`min-h-screen bg-white text-foreground overflow-x-hidden max-w-full ${isFadingOut ? 'opacity-0' : ''}`}
          style={{ opacity: 0 }} // Start invisible, GSAP handles animation
        >
        {/* Navigation */}
        <Navbar />
        
        {/* Main Sections */}
        <main>
          <Hero />
          <AboutUs />
          <Stats />
          <Features />
          <Partners />
          <WorldMapDemoEs />
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

export default function SpanishHome() {
  return (
    <NextIntlClientProvider messages={messages} locale="es">
      <HomeContent />
    </NextIntlClientProvider>
  )
}
