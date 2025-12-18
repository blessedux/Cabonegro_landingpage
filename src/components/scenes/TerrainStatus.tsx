'use client'

import { useEffect, useState } from 'react'

/**
 * Component to display terrain loading status on screen
 */
export default function TerrainStatus() {
  const [status, setStatus] = useState<{
    heightmapLoaded: boolean
    terrainMesh: boolean
    error: string | null
  }>({
    heightmapLoaded: false,
    terrainMesh: false,
    error: null
  })

  useEffect(() => {
    const checkStatus = () => {
      const terrainMesh = (window as any).__terrainMesh
      const isLoaded = terrainMesh && 
                      terrainMesh.geometry && 
                      terrainMesh.material &&
                      terrainMesh.geometry.attributes.position &&
                      terrainMesh.geometry.attributes.position.count > 0
      
      setStatus(prev => ({
        ...prev,
        terrainMesh: !!isLoaded
      }))
    }

    // Check immediately
    checkStatus()

    // Listen for terrain mesh updates
    const interval = setInterval(checkStatus, 500)
    
    // Listen for terrain mesh updates via window object only
    // Don't intercept console.log - it causes too many logs
    const checkTerrainMesh = () => {
      const terrainMesh = (window as any).__terrainMesh
      if (terrainMesh && terrainMesh.geometry && terrainMesh.material) {
        setStatus(prev => ({ ...prev, heightmapLoaded: true, terrainMesh: true }))
      }
    }
    
    // Check periodically for terrain mesh
    const terrainCheckInterval = setInterval(checkTerrainMesh, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(terrainCheckInterval)
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '250px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Terrain Status</div>
      <div style={{ marginBottom: '5px' }}>
        Heightmap: {status.heightmapLoaded ? '✓ Loaded' : '⏳ Loading...'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        Terrain Mesh: {status.terrainMesh ? '✓ Loaded' : status.terrainMesh === false && (window as any).__terrainMesh ? '⏳ Found but not loaded...' : '✗ Not found'}
      </div>
      {status.error && (
        <div style={{ color: '#ff6b6b', marginTop: '10px' }}>
          ⚠ {status.error}
        </div>
      )}
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Check console for details
      </div>
    </div>
  )
}
