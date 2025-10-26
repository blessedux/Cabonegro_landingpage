'use client'

import { useState } from 'react'
import { AnimationProvider, useAnimation } from '@/contexts/AnimationContext'
import { PreloaderProvider, usePreloader } from '@/contexts/PreloaderContext'
import Preloader from '@/components/ui/preloader'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import CookieBanner from '@/components/sections/CookieBanner'
import Features from '@/components/sections/Features'
import IndustrialSpecs from '@/components/sections/IndustrialSpecs'
import Stats from '@/components/sections/Stats'
import H2VOpportunity from '@/components/sections/HowItWorks'
import IndustrialPark from '@/components/sections/Projects'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'

function HomeContent() {
  const [showCookieBanner, setShowCookieBanner] = useState(true)
  const { isFadingOut } = useAnimation()
  const { isPreloaderVisible, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
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

      {/* Main Content - Only shows after preloader completes */}
      <div className={`min-h-screen bg-black text-white transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'} ${isPreloaderVisible ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <Hero />
        <CookieBanner 
          showCookieBanner={showCookieBanner}
          setShowCookieBanner={setShowCookieBanner}
        />
        <Features />
        <IndustrialSpecs />
        <Stats />
        <H2VOpportunity />
        <IndustrialPark />
        <FAQ />
        <Footer />
      </div>
    </>
  )
}

export default function Home() {
  return (
    <PreloaderProvider>
      <AnimationProvider>
        <HomeContent />
      </AnimationProvider>
    </PreloaderProvider>
  )
}