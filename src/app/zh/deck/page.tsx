'use client'

import { useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import NavbarZh from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

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
        <main className="pt-0 h-screen">
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
