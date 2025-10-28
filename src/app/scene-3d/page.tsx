'use client'

import { useState } from 'react'
import GoogleMaps3DScene from '@/components/ui/google-maps-3d-scene'

export default function Scene3DPage() {
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [sceneError, setSceneError] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">3D Scene View</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">📍 Location Details</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Latitude:</span> -52.9184179568509</p>
                <p><span className="text-gray-400">Longitude:</span> -70.8293537877123</p>
                <p><span className="text-gray-400">Altitude:</span> 26,108.65m</p>
                <p><span className="text-gray-400">Region:</span> Patagonia, Chile</p>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">🎬 Scene Settings</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Auto-rotation:</span> Enabled</p>
                <p><span className="text-gray-400">Smooth transitions:</span> Enabled</p>
                <p><span className="text-gray-400">Altitude view:</span> Enabled</p>
                <p><span className="text-gray-400">Map type:</span> Hybrid</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Scene Status</h2>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg ${sceneLoaded ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                {sceneLoaded ? '✅ Scene Loaded' : '⏳ Loading Scene...'}
              </div>
              {sceneError && (
                <div className="px-4 py-2 rounded-lg bg-red-900/50 text-red-400">
                  ❌ Load Error
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="relative w-full h-[80vh] min-h-[600px]">
        <GoogleMaps3DScene
          center={{ lat: -52.9184179568509, lng: -70.8293537877123 }}
          altitude={26108.65}
          tilt={45}
          heading={0}
          mode="hybrid"
          enableAutoRotation={true}
          enableSmoothTransitions={true}
          enableAltitudeView={true}
          className="w-full h-full"
          onLoad={() => {
            console.log('🎬 3D Scene loaded successfully!')
            setSceneLoaded(true)
            setSceneError(false)
          }}
          onError={(error) => {
            console.error('❌ 3D Scene error:', error)
            setSceneError(true)
            setSceneLoaded(false)
          }}
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">🎮 Controls</h3>
            <div className="text-xs space-y-1">
              <p>• Hover to pause rotation</p>
              <p>• Scroll to zoom</p>
              <p>• Drag to pan</p>
              <p>• Ctrl+drag to tilt</p>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {!sceneLoaded && !sceneError && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Loading 3D Scene</h3>
              <p className="text-gray-400">Initializing high-altitude view...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">ℹ️ About This Scene</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>This 3D scene shows a high-altitude view of Patagonia, Chile at 26,108.65 meters above sea level.</p>
              <p>The scene features smooth animations, auto-rotation, and optimized zoom levels for the specified altitude.</p>
              <p>Interactive controls allow you to explore the terrain from this unique perspective.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
