'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'

function DeckPageContentEn() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {isVisible && (
        <main className="pt-20 h-screen">
          <div className="h-full">
            <iframe 
              src="https://gamma.app/embed/8uz4114rec81me0" 
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title="Cabo Negro: Strategic Investment in Green Hydrogen and Global Trade"
              className="border-0"
            />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  )
}

export default function DeckPageEn() {
  return <DeckPageContentEn />
}
