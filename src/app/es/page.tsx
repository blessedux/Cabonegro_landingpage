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
import { CaboNegroRulerCarousel } from '@/components/sections/RulerCarousel'
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

  // Handle content fade-in animation
  useEffect(() => {
    if (contentReady && contentRef.current) {
      // Start content fade-in animation
      gsap.fromTo(contentRef.current, 
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1.2,
          ease: 'power2.out'
        }
      )
    }
  }, [contentReady])

  const handlePreloaderFadeOutStart = () => {
    // Pre-render content when preloader starts fading out
    setContentReady(true)
    setPreloaderFadeComplete(true)
  }

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
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
          className={`min-h-screen bg-black text-white ${isFadingOut ? 'opacity-0' : ''}`}
          style={{ opacity: 0 }} // Start invisible, GSAP handles animation
        >
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
