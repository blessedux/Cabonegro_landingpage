'use client'

import { useState, useEffect } from 'react'
import { PreloaderProvider } from '@/contexts/PreloaderContext'
import { AnimationProvider } from '@/contexts/AnimationContext'
import NavbarEs from '@/components/sections/Navbar-es'
import FooterEs from '@/components/sections/Footer-es'

function DeckPageContentEs() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      <NavbarEs />
      
      {isVisible && (
        <main className="pt-20 h-screen">
          <div className="h-full">
            <iframe 
              src="https://gamma.app/embed/8uz4114rec81me0" 
              style={{ width: '100%', height: '100%' }} 
              allow="fullscreen" 
              title="Cabo Negro: Inversión Estratégica en Hidrógeno Verde y Comercio Global"
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
  return (
    <PreloaderProvider>
      <AnimationProvider>
        <DeckPageContentEs />
      </AnimationProvider>
    </PreloaderProvider>
  )
}
