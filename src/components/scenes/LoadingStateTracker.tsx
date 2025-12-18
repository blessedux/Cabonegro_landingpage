'use client'

import { useEffect } from 'react'

interface LoadingState {
  terrain: { loaded: boolean; message: string }
  satelliteTiles: { loaded: boolean; message: string; progress?: number }
  models: { loaded: boolean; message: string }
  scene: { ready: boolean; message: string }
}

/**
 * Component that tracks and updates loading state for the 3D scene
 * Updates window.__loadingState which is read by LoadingScreen
 */
export function LoadingStateTracker() {
  useEffect(() => {
    // Initialize loading state
    const initialState: LoadingState = {
      terrain: { loaded: false, message: 'Loading terrain heightmap...' },
      satelliteTiles: { loaded: false, message: 'Loading satellite imagery tiles...', progress: 0 },
      models: { loaded: false, message: 'Loading 3D models...' },
      scene: { ready: false, message: 'Initializing 3D scene...' }
    }
    
    ;(window as any).__loadingState = initialState

    // Monitor terrain mesh
    const checkTerrain = () => {
      const terrainMesh = (window as any).__terrainMesh
      if (terrainMesh && terrainMesh.geometry && terrainMesh.material) {
        const state = (window as any).__loadingState || initialState
        ;(window as any).__loadingState = {
          ...state,
          terrain: { loaded: true, message: 'Terrain heightmap loaded ✓' }
        }
      }
    }

    // Monitor satellite tiles loading
    const checkSatelliteTiles = () => {
      // Check if satellite texture is loaded by looking for canvas texture
      const terrainMesh = (window as any).__terrainMesh
      if (terrainMesh?.material?.uniforms?.satelliteTexture?.value) {
        const texture = terrainMesh.material.uniforms.satelliteTexture.value
        const isCanvasTexture = texture.constructor.name === 'CanvasTexture'
        const hasImage = texture.image && texture.image.width > 0
        
        if (isCanvasTexture && hasImage) {
          const state = (window as any).__loadingState || initialState
          ;(window as any).__loadingState = {
            ...state,
            satelliteTiles: { loaded: true, message: 'Satellite imagery loaded ✓', progress: 100 }
          }
        }
      }
    }

    // Monitor models
    const checkModels = () => {
      // Models are loaded when terrain is ready (they snap to terrain)
      const terrainMesh = (window as any).__terrainMesh
      if (terrainMesh && terrainMesh.geometry) {
        // Give models a moment to load after terrain
        setTimeout(() => {
          const state = (window as any).__loadingState || initialState
          ;(window as any).__loadingState = {
            ...state,
            models: { loaded: true, message: '3D models loaded ✓' }
          }
        }, 1000)
      }
    }

    // Mark scene as ready when all components are loaded
    const checkSceneReady = () => {
      const state = (window as any).__loadingState || initialState
      if (state.terrain.loaded && state.satelliteTiles.loaded && state.models.loaded) {
        ;(window as any).__loadingState = {
          ...state,
          scene: { ready: true, message: 'Scene ready ✓' }
        }
      }
    }

    // Poll for updates
    const interval = setInterval(() => {
      checkTerrain()
      checkSatelliteTiles()
      checkModels()
      checkSceneReady()
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return null
}

/**
 * Helper function to update loading state from other components
 */
export function updateLoadingState(updates: Partial<LoadingState>) {
  const currentState = (window as any).__loadingState || {
    terrain: { loaded: false, message: 'Loading terrain heightmap...' },
    satelliteTiles: { loaded: false, message: 'Loading satellite imagery tiles...', progress: 0 },
    models: { loaded: false, message: 'Loading 3D models...' },
    scene: { ready: false, message: 'Initializing 3D scene...' }
  }

  ;(window as any).__loadingState = {
    ...currentState,
    ...updates
  }
}
