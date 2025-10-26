'use client'

import { useState } from 'react'

export default function LayoutPreloaderTest() {
  const [isPlaying, setIsPlaying] = useState(false)

  const startAnimation = () => {
    setIsPlaying(true)
    // Reset after animation completes
    setTimeout(() => setIsPlaying(false), 5000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Layout Preloader Test
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Layout Preloader Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={startAnimation}
              disabled={isPlaying}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              {isPlaying ? 'Animation Running...' : 'Start Layout Animation'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Layout Preloader Demo</h2>
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">
              CABO NEGRO
            </div>
            <div className="text-xl text-gray-300 mb-8">
              Industrial Development
            </div>
            <div className="text-sm text-gray-400">
              This is a placeholder for the layout preloader component.
              The actual component will be created next.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p className="mb-4">
            This test page is for the layout preloader component.
          </p>
          <p className="text-sm">
            The layout preloader will have more complex animations with images and text sequences.
          </p>
        </div>
      </div>
    </div>
  )
}
