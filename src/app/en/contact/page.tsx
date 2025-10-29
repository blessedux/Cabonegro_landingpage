'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import Navbar from '@/components/sections/Navbar'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

const messages = {
  "contact": {
    "title": "Contact Us",
    "subtitle": "Get more information"
  }
}

function ContactContent() {
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const { isPreloaderVisible, isPreloaderComplete } = usePreloader()

  // Bypass preloader for contact page
  useEffect(() => {
    setPreloaderFadeComplete(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
        <Navbar />
      
      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <Contact />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}

export default function EnglishContact() {
  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <ContactContent />
    </NextIntlClientProvider>
  )
}
