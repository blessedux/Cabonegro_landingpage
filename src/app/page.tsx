'use client'

import { useState } from 'react'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import CookieBanner from '@/components/sections/CookieBanner'
import Features from '@/components/sections/Features'
import DynamicPDF from '@/components/sections/DynamicPDF'
import Stats from '@/components/sections/Stats'
import HowItWorks from '@/components/sections/HowItWorks'
import Projects from '@/components/sections/Projects'
import Partners from '@/components/sections/Partners'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'

export default function Home() {
  const [showCookieBanner, setShowCookieBanner] = useState(true)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <CookieBanner 
        showCookieBanner={showCookieBanner}
        setShowCookieBanner={setShowCookieBanner}
      />
      <Features />
      <DynamicPDF />
      <Stats />
      <HowItWorks />
      <Projects />
      <Partners />
      <FAQ />
      <Footer />
    </div>
  )
}