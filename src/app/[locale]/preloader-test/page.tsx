'use client'

import { useState } from 'react'
import Preloader from '@/components/ui/preloader'

export default function PreloaderTestPage() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [preloaderComplete, setPreloaderComplete] = useState(false)
  const [duration, setDuration] = useState(6)

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
    setShowPreloader(false)
  }

  const resetPreloader = () => {
    setShowPreloader(true)
    setPreloaderComplete(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Test Controls */}
      <div className="fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-white">Preloader Test Controls</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={resetPreloader}
              disabled={showPreloader}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Reset Preloader
            </button>
            
            <button
              onClick={() => setShowPreloader(!showPreloader)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              {showPreloader ? 'Hide' : 'Show'} Preloader
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            Status: {preloaderComplete ? 'Complete' : showPreloader ? 'Running' : 'Hidden'}
          </div>
        </div>
      </div>

      {/* Preloader */}
      {showPreloader && (
        <Preloader 
          onComplete={handlePreloaderComplete} 
          duration={duration}
        />
      )}

      {/* Test Content */}
      <div className={`transition-opacity duration-1000 ${showPreloader ? 'opacity-0' : 'opacity-100'}`}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-white">
              Preloader Test Page
            </h1>
            
            <div className="space-y-4 text-gray-300">
              <p className="text-xl">
                This is the main content that appears after the preloader completes.
              </p>
              
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-white">Test Features:</h3>
                <ul className="text-left space-y-2">
                  <li>• Adjustable animation duration (2-10 seconds)</li>
                  <li>• Reset functionality to test multiple times</li>
                  <li>• Show/hide controls for debugging</li>
                  <li>• Real-time status monitoring</li>
                  <li>• Isolated testing environment</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold mb-3 text-white">Cabo Negro Business Animation:</h3>
                <ol className="text-left space-y-1 text-sm">
                  <li>1. Industrial development messages with scramble effects</li>
                  <li>2. Market analysis progress bar (0% to 100%)</li>
                  <li>3. Strategic planning glitch effects</li>
                  <li>4. Investment opportunity reveals</li>
                  <li>5. Industrial gateway opening transition</li>
                  <li>6. Business excellence quote animation</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
