'use client'

import { useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import { useAnimation } from '@/contexts/AnimationContext'
import Preloader from '@/components/ui/preloader'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Stats from '@/components/sections/Stats'
import Partners from '@/components/sections/Partners'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import CookieBanner from '@/components/sections/CookieBanner'

// Mock messages for the main page
const messages = {
  features: {
    title: "Strategic Investment Opportunity",
    subtitle: "Cabo Negro represents a unique convergence of strategic location, renewable energy potential, and ready-to-build infrastructure",
    strategicGateway: {
      title: "Strategic Gateway",
      description: "Panama Canal alternative connecting Atlantic and Pacific Oceans",
      highlights: [
        "Primary gateway to Antarctica",
        "Free of tolls and geopolitical risks",
        "Atlantic-Pacific maritime corridor"
      ]
    },
    h2vOpportunity: {
      title: "H₂V Opportunity",
      description: "Magallanes could produce 13% of the world's green hydrogen",
      highlights: [
        "200+ projects filed or under review",
        "Expected to double regional GDP",
        "EDF entering by end of 2025"
      ]
    },
    industrialReady: {
      title: "Industrial Ready",
      description: "300+ hectares of ready-to-build industrial infrastructure",
      highlights: [
        "Connected to Route 9N main corridor",
        "6 internal roads (33% built)",
        "13 MW electrical capacity"
      ]
    },
    maritimeTerminal: {
      title: "Maritime Terminal",
      description: "Dual-phase port construction ready-to-build by 2026",
      highlights: [
        "Protected port location",
        "Phase 1: 350m platform + ramp",
        "Phase 2: 350m bridge + 300m pier"
      ]
    },
    regulatoryAdvantage: {
      title: "Regulatory Advantage",
      description: "Streamlined permitting and international compliance",
      highlights: [
        "SEA environmental approval",
        "International maritime standards",
        "Fast-track development process"
      ]
    },
    investmentReady: {
      title: "Investment Ready",
      description: "Immediate development opportunities with proven infrastructure",
      highlights: [
        "Ready-to-build industrial lots",
        "Existing utility connections",
        "Strategic partnership opportunities"
      ]
    }
  },
  partners: {
    title: "Trusted Partners",
    subtitle: "Strategic Alliances",
    description: "Working with industry leaders to build Chile's premier industrial and maritime hub"
  }
}

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

export default function Home() {
  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <HomeContent />
    </NextIntlClientProvider>
  )
}