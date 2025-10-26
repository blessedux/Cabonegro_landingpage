'use client'

import { useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { PreloaderProvider, usePreloader } from '@/contexts/PreloaderContext'
import { AnimationProvider, useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader-es'
import Hero from '@/components/sections/Hero-es'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats-es'
import Projects from '@/components/sections/Projects-es'
import Partners from '@/components/sections/Partners'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'
import spanishMessages from '../../../messages/es.json'

function HomeContent() {
  const [showCookieBanner, setShowCookieBanner] = useState(true)
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, setPreloaderVisible, setPreloaderComplete } = usePreloader()

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
        
        {/* Main Sections */}
        <main>
          <Hero />
          <Features />
          <Stats />
          <Projects />
          <Partners />
          <FAQ />
        </main>

        {/* Footer */}
        <Footer />

        {/* Cookie Banner */}
        {showCookieBanner && (
          <CookieBanner onAccept={() => setShowCookieBanner(false)} />
        )}
        </div>
      )}
    </>
  )
}

export default function SpanishHome() {
  return (
    <PreloaderProvider>
      <AnimationProvider>
        <NextIntlClientProvider messages={spanishMessages} locale="es">
          <HomeContent />
        </NextIntlClientProvider>
      </AnimationProvider>
    </PreloaderProvider>
  )
}
