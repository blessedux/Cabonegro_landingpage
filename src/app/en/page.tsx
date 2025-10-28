'use client'

import { useState, useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats'
import Projects from '@/components/sections/Projects'
import Timeline from '@/components/sections/Timeline'
import Partners from '@/components/sections/Partners'
import { Roadmap } from '@/components/sections/Roadmap'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'
import { NextIntlClientProvider } from 'next-intl'
import englishMessages from '../../../messages/en.json'

function HomeContent() {
  const [assetsPreloaded, setAssetsPreloaded] = useState(false)
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, hasSeenPreloader, setPreloaderVisible, setPreloaderComplete } = usePreloader()

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
          
          {/* Main Sections */}
          <main>
            <Hero />
            <Features />
            <Stats />
            <Projects />
            <Timeline />
            <Partners />
            <Roadmap />
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
    <NextIntlClientProvider messages={englishMessages} locale="en">
      <HomeContent />
    </NextIntlClientProvider>
  )
}