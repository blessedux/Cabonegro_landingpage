'use client'

import { useEffect, useState } from 'react'

interface LoadingState {
  terrain: { loaded: boolean; message: string }
  satelliteTiles: { loaded: boolean; message: string; progress?: number }
  models: { loaded: boolean; message: string }
  scene: { ready: boolean; message: string }
}

const defaultState: LoadingState = {
  terrain: { loaded: false, message: 'Loading terrain heightmap...' },
  satelliteTiles: { loaded: false, message: 'Loading satellite imagery tiles...', progress: 0 },
  models: { loaded: false, message: 'Loading 3D models...' },
  scene: { ready: false, message: 'Initializing 3D scene...' }
}

export default function LoadingScreen() {
  const [loadingState, setLoadingState] = useState<LoadingState>(defaultState)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Check loading state from window object (set by Experience3D and other components)
    const checkLoadingState = () => {
      const state = (window as any).__loadingState || defaultState
      setLoadingState(state)
      
      // Check if everything is loaded
      const allLoaded = 
        state.terrain.loaded &&
        state.satelliteTiles.loaded &&
        state.models.loaded &&
        state.scene.ready
      
      if (allLoaded && !isComplete) {
        // Small delay before hiding to show completion message
        setTimeout(() => {
          setIsComplete(true)
        }, 500)
      }
    }

    // Check immediately
    checkLoadingState()

    // Poll for updates
    const interval = setInterval(checkLoadingState, 200)
    
    return () => clearInterval(interval)
  }, [isComplete])

  // Calculate overall progress
  const progress = Math.round(
    ((loadingState.terrain.loaded ? 25 : 0) +
     (loadingState.satelliteTiles.loaded ? 50 : loadingState.satelliteTiles.progress || 0) +
     (loadingState.models.loaded ? 15 : 0) +
     (loadingState.scene.ready ? 10 : 0))
  )

  if (isComplete) {
    return null // Hide loading screen when complete
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo/Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Loading 3D Map</h2>
          <p className="text-gray-400 text-sm">Cabo Negro, Chile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white text-sm font-medium">{progress}%</p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 text-left">
          {/* Terrain */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              loadingState.terrain.loaded 
                ? 'bg-green-500' 
                : 'bg-gray-700 border-2 border-gray-600'
            }`}>
              {loadingState.terrain.loaded && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                loadingState.terrain.loaded ? 'text-green-400' : 'text-gray-400'
              }`}>
                {loadingState.terrain.message}
              </p>
            </div>
          </div>

          {/* Satellite Tiles */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              loadingState.satelliteTiles.loaded 
                ? 'bg-green-500' 
                : 'bg-gray-700 border-2 border-gray-600'
            }`}>
              {loadingState.satelliteTiles.loaded ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                loadingState.satelliteTiles.loaded ? 'text-green-400' : 'text-gray-400'
              }`}>
                {loadingState.satelliteTiles.message}
                {!loadingState.satelliteTiles.loaded && loadingState.satelliteTiles.progress !== undefined && (
                  <span className="ml-2 text-blue-400">
                    ({loadingState.satelliteTiles.progress}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Models */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              loadingState.models.loaded 
                ? 'bg-green-500' 
                : 'bg-gray-700 border-2 border-gray-600'
            }`}>
              {loadingState.models.loaded ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                loadingState.models.loaded ? 'text-green-400' : 'text-gray-400'
              }`}>
                {loadingState.models.message}
              </p>
            </div>
          </div>

          {/* Scene */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              loadingState.scene.ready 
                ? 'bg-green-500' 
                : 'bg-gray-700 border-2 border-gray-600'
            }`}>
              {loadingState.scene.ready ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${
                loadingState.scene.ready ? 'text-green-400' : 'text-gray-400'
              }`}>
                {loadingState.scene.message}
              </p>
            </div>
          </div>
        </div>

        {/* Spinner */}
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
