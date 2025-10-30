'use client'

import { useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import { DownloadDeckButton } from '@/components/ui/download-deck-button'

const messages = {
  "deck": {
    "title": "卡波内格罗甲板",
    "subtitle": "查看我们的战略发展演示"
  }
}

function DeckContent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <NavbarZh />
      
      {isVisible && (
        <main className="pt-0 h-screen relative">
          {/* Download Button Overlay */}
          <div className="absolute top-24 right-4 z-10">
            <DownloadDeckButton 
              variant="outline"
              language="zh"
              className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black shadow-lg"
            />
          </div>
          
          <div className="h-full w-full">
            <iframe 
              src="https://gamma.app/embed/8uz4114rec81me0" 
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title="卡波内格罗：绿色氢气和全球贸易的战略投资"
              className="border-0"
            />
          </div>
        </main>
      )}
      
      <Footer />
      <CookieBanner />
    </div>
  )
}

export default function ChineseDeck() {
  return (
    <NextIntlClientProvider messages={messages} locale="zh">
      <DeckContent />
    </NextIntlClientProvider>
  )
}
