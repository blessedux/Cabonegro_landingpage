'use client'

import { useState } from 'react'
import Preloader from '@/components/ui/preloader'

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [preloaderComplete, setPreloaderComplete] = useState(false)

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setShowPreloader(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Preloader */}
      {showPreloader && (
        <Preloader 
          onComplete={handlePreloaderComplete}
          duration={6}
        />
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${showPreloader ? 'opacity-0' : 'opacity-100'}`}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-white">
              Cabo Negro Industrial Development
            </h1>
            
            <div className="space-y-4 text-gray-300">
              <p className="text-xl">
                Welcome to Cabo Negro - Chile's strategic gateway to industrial excellence.
              </p>
              
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-white">Industrial Zone Features:</h3>
                <ul className="text-left space-y-2">
                  <li>• H₂V Green Hydrogen Production Hub</li>
                  <li>• Maritime Terminal Infrastructure</li>
                  <li>• Panama Canal Alternative Route</li>
                  <li>• 300+ Hectares Industrial Development</li>
                  <li>• Strategic Atlantic-Pacific Corridor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}