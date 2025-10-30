'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import { DownloadDeckButton } from '@/components/ui/download-deck-button'

function DeckPageContent() {
  const params = useParams()
  const locale = params.locale as string || 'en'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100) // Reduced delay for faster navbar appearance
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
              language={locale as 'en' | 'es' | 'zh'}
              className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black shadow-lg"
            />
          </div>
          
          <div className="h-full">
            <iframe 
              src={locale === 'es' ? "https://gamma.app/embed/zm41xbb61dhw009" : "https://gamma.app/embed/8uz4114rec81me0"}
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title={locale === 'es' ? "Cabo Negro: Pitchdeck ES" : "Cabo Negro: Strategic Investment in Green Hydrogen & Global Trade"}
              className="border-0"
            />
          </div>
        </main>
      )}
      
      <Footer />
    </div>
  )
}

export default function DeckPage() {
  return <DeckPageContent />
}
