'use client'

import { useEffect } from 'react'
import { usePreloader } from '@/contexts/PreloaderContext'
import Navbar from '@/components/sections/Navbar-zh'
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
          <h1 className="text-5xl md:text-6xl font-bold mb-8">卡波内格罗工业园</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 mb-6">
              综合性工业区，旨在支持绿色氢经济并促进智利最南端的国际贸易。
            </p>
            <p className="text-lg text-gray-400">
              此页面正在开发中。有关工业园的更多信息将很快提供。
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

