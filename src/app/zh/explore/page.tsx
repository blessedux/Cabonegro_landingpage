'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NextIntlClientProvider } from 'next-intl'
import { usePreloader } from '@/contexts/PreloaderContext'
import UnifiedNavbar from '@/components/sections/UnifiedNavbar'
import Footer from '@/components/sections/Footer'
import CookieBanner from '@/components/sections/CookieBanner'
import GoogleMaps3DScene from '@/components/ui/google-maps-3d-scene'

const messages = {
  "explore": {
    "title": "探索卡波内格罗",
    "subtitle": "通过我们的交互式3D地图体验，发现卡波内格罗在麦哲伦地区中心的战略位置和独特优势。"
  }
}

function ExploreContent() {
  const [preloaderFadeComplete, setPreloaderFadeComplete] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [mapsError, setMapsError] = useState(false)
  const { setPreloaderComplete, setPreloaderVisible } = usePreloader()

  // Immediately set preloader complete to bypass preloader for explore page
  useEffect(() => {
    setPreloaderComplete(true)
    setPreloaderVisible(false)
    setPreloaderFadeComplete(true)
  }, [setPreloaderComplete, setPreloaderVisible])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
        <UnifiedNavbar />
      
      {/* Main Content - Google Maps 3D Scene */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              探索卡波内格罗
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              通过我们的交互式3D地图体验，发现卡波内格罗在麦哲伦地区中心的战略位置和独特优势。
            </p>
          </div>

          {/* Google Maps 3D Scene Container */}
          <div className="relative w-full h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/50">
            <GoogleMaps3DScene
              center={{ lat: -52.9184179568509, lng: -70.8293537877123 }} // Your specific coordinates
              altitude={26108.65}
              tilt={75}
              heading={330}
              zoom={10}
              mode="hybrid"
              className="w-full h-full rounded-xl sm:rounded-2xl"
              enableAutoRotation={true}
              enableSmoothTransitions={true}
              enableAltitudeView={true}
              onLoad={() => {
                console.log('Google Maps 3D Scene loaded successfully')
                setMapsLoaded(true)
              }}
              onError={(error) => {
                console.error('Google Maps 3D Scene error:', error)
                setMapsError(true)
              }}
            />
            
            {!mapsLoaded && !mapsError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-gray-300">加载3D地图中...</p>
                </div>
              </div>
            )}
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-3">战略位置</h3>
              <p className="text-gray-300">
                位于智利南部麦哲伦地区的战略位置，提供通往比格尔海峡的直接通道。
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-3">海域特许权</h3>
              <p className="text-gray-300">
                77公顷的海域特许权已确认，为港口和海事基础设施开发提供基础。
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-3">基础设施</h3>
              <p className="text-gray-300">
                直接连接9号公路北段，提供与智利主要交通网络的连接。
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}

export default function ChineseExplore() {
  return (
    <NextIntlClientProvider messages={messages} locale="zh">
      <ExploreContent />
    </NextIntlClientProvider>
  )
}
