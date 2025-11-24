'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { usePreloader } from '@/contexts/PreloaderContext'
import Navbar from '@/components/sections/Navbar-zh'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'

export default function PatagonValleyPage() {
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
          <h1 className="text-5xl md:text-6xl font-bold mb-8">Patagon Valley</h1>
          <div className="mb-8 rounded-xl overflow-hidden">
            <Image
              src="/lots_model.png"
              alt="Patagon Valley开发模型"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 mb-6">
              战略性房地产开发，配备先进的技术基础设施，包括AWS和GTD设施。
            </p>
            <p className="text-lg text-gray-400">
              此页面正在开发中。有关Patagon Valley的更多信息将很快提供。
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

