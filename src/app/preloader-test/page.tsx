'use client'

import { useState } from 'react'
import { PreloaderProvider, usePreloader } from '@/contexts/PreloaderContext'
import Preloader from '@/components/ui/preloader'

function PreloaderTestContent() {
  const { isPreloaderVisible, isPreloaderComplete } = usePreloader()
  const [duration, setDuration] = useState(6)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePreloaderComplete = () => {
    console.log('Preloader completed!')
  }

  const resetPreloader = () => {
    window.location.reload()
  }

  const togglePreloader = () => {
    if (isPreloaderVisible) {
      // If preloader is visible, we can't hide it during animation
      console.log('Preloader is currently animating, cannot hide')
    } else {
      // If preloader is not visible, we can show it again by reloading
      resetPreloader()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Cabo Negro Preloader Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Preloader Controls</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Animation Duration: {duration}s
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={resetPreloader}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Reset Preloader
              </button>
              
              <button
                onClick={togglePreloader}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                disabled={isPreloaderVisible}
              >
                {isPreloaderVisible ? 'Preloader Running...' : 'Show Preloader'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Status Monitor</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Preloader Visible:</span>
              <span className={isPreloaderVisible ? 'text-green-400' : 'text-red-400'}>
                {isPreloaderVisible ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Preloader Complete:</span>
              <span className={isPreloaderComplete ? 'text-green-400' : 'text-yellow-400'}>
                {isPreloaderComplete ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p className="mb-4">
            This test page allows you to work on the preloader component in isolation.
          </p>
          <p className="text-sm">
            The preloader will automatically start when you load this page.
            Use the controls above to test different scenarios.
          </p>
        </div>
      </div>

      {/* Preloader Component */}
      {isPreloaderVisible && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}
    </div>
  )
}

export default function PreloaderTest() {
  return (
    <PreloaderProvider>
      <PreloaderTestContent />
    </PreloaderProvider>
  )
}