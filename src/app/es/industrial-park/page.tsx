'use client'

import { useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import Navbar from '@/components/sections/Navbar-es'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

export default function IndustrialParkPage() {
  const { setPreloaderComplete, setPreloaderVisible } = usePreloader()

  useEffect(() => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
  }, [setPreloaderComplete, setPreloaderVisible])

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">Parque Industrial Cabonegro</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 mb-6">
              Zona industrial integral diseñada para soportar la economía del hidrógeno verde y facilitar el comercio internacional en el extremo sur de Chile.
            </p>
            <p className="text-lg text-gray-400">
              Esta página está en desarrollo. Más información sobre el Parque Industrial estará disponible pronto.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

