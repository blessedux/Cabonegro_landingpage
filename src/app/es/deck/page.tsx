'use client'

import { useState, useEffect } from 'react'
import NavbarEs from '@/components/sections/Navbar-es'
import FooterEs from '@/components/sections/Footer-es'
import { DownloadDeckButton } from '@/components/ui/download-deck-button'

function DeckPageContentEs() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <NavbarEs />
      
      {isVisible && (
        <main className="pt-20 h-screen relative">
          {/* Download Button Overlay */}
          <div className="absolute top-24 right-4 z-10">
            <DownloadDeckButton 
              variant="outline"
              language="es"
              className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black shadow-lg"
            />
          </div>
          
          <div className="h-full">
            <iframe 
              src="https://gamma.app/embed/zm41xbb61dhw009" 
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title="Cabo Negro: Pitchdeck ES"
              className="border-0"
            />
          </div>
        </main>
      )}
      
      <FooterEs />
    </div>
  )
}

export default function DeckPageEs() {
  return <DeckPageContentEs />
}
