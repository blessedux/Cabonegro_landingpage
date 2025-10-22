'use client'

import { useState } from 'react'
import { AnimationProvider, useAnimation } from '@/contexts/AnimationContext'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import CookieBanner from '@/components/sections/CookieBanner'
import Features from '@/components/sections/Features'
import IndustrialSpecs from '@/components/sections/IndustrialSpecs'
import Stats from '@/components/sections/Stats'
import H2VOpportunity from '@/components/sections/HowItWorks'
import IndustrialPark from '@/components/sections/Projects'
import MaritimeTerminal from '@/components/sections/Partners'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'

function HomeContent() {
  const [showCookieBanner, setShowCookieBanner] = useState(true)
  const { isFadingOut } = useAnimation()

  return (
    <div className={`min-h-screen bg-black text-white transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
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
      <MaritimeTerminal />
      <FAQ />
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AnimationProvider>
      <HomeContent />
    </AnimationProvider>
  )
}