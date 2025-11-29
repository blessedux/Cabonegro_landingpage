'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import { DownloadDeckButton } from '@/components/ui/download-deck-button'

function DeckPageContentFr() {
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
        <main className="pt-20 h-screen relative">
          {/* Download Button Overlay */}
          <div className="absolute top-24 right-4 z-10">
            <DownloadDeckButton 
              variant="outline"
              language="fr"
              className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black shadow-lg"
            />
          </div>
          
          <div className="h-full">
            <iframe 
              src="https://gamma.app/embed/8uz4114rec81me0" 
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title="Cabo Negro: Investissement Stratégique dans l'Hydrogène Vert et le Commerce Mondial"
              className="border-0"
            />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  )
}

export default function DeckPageFr() {
  return <DeckPageContentFr />
}

