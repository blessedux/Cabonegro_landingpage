'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import NavbarZh from '@/components/sections/Navbar-zh'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

const messages = {
  "contact": {
    "title": "联系我们",
    "subtitle": "获取更多信息"
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
        <NavbarZh />
      
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

export default function ChineseContact() {
  return (
    <NextIntlClientProvider messages={messages} locale="zh">
      <ContactContent />
    </NextIntlClientProvider>
  )
}
