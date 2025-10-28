'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import NavbarEs from '@/components/sections/Navbar-es'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

const messages = {
  "contact": {
    "title": "Contáctanos",
    "subtitle": "Obtén más información"
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
        <NavbarEs />
      
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

export default function SpanishContact() {
  return (
    <NextIntlClientProvider messages={messages} locale="es">
      <ContactContent />
    </NextIntlClientProvider>
  )
}
