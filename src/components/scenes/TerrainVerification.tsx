'use client'

import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Component to verify terrain is using real heightmap data
 * Shows on-screen info about terrain geometry
 */
export default function TerrainVerification() {
  const { scene } = useThree()
  const [terrainInfo, setTerrainInfo] = useState<{
    vertices: number
    heightRange: { min: number; max: number }
    hasColors: boolean
    status: string
  } | null>(null)

  useEffect(() => {
    const checkTerrain = () => {
      const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
      
      if (!terrainMesh || !terrainMesh.geometry) {
        setTerrainInfo({
          vertices: 0,
          heightRange: { min: 0, max: 0 },
          hasColors: false,
          status: 'Terrain mesh not found'
        })
        return
      }

      const geometry = terrainMesh.geometry
      const positions = geometry.attributes.position?.array as Float32Array | undefined
      
      if (!positions) {
        setTerrainInfo({
          vertices: 0,
          heightRange: { min: 0, max: 0 },
          hasColors: false,
          status: 'No position data'
        })
        return
      }

      // Calculate height range
      let minY = Infinity
      let maxY = -Infinity
      for (let i = 1; i < positions.length; i += 3) {
        const y = positions[i]
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }

      const heightVariation = maxY - minY
      const hasColors = !!geometry.attributes.color
      const vertexCount = positions.length / 3

      let status = 'OK'
      if (heightVariation < 10) {
        status = '⚠️ FLAT - Height variation too small!'
      } else if (heightVariation < 50) {
        status = '⚠️ Low variation - may appear flat'
      } else {
        status = '✓ Real terrain data detected'
      }

      setTerrainInfo({
        vertices: vertexCount,
        heightRange: { min: minY, max: maxY },
        hasColors,
        status
      })
    }

    // Check immediately and periodically
    checkTerrain()
    const interval = setInterval(checkTerrain, 1000)

    return () => clearInterval(interval)
  }, [scene])

  if (process.env.NODE_ENV !== 'development' || !terrainInfo) {
    return null
  }

  const heightVariation = terrainInfo.heightRange.max - terrainInfo.heightRange.min
  const isFlat = heightVariation < 10

  return (
    <Html
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      portal={{ current: document.body }}
    >
      <div style={{
        position: 'fixed',
        top: 60,
        left: 10,
        background: isFlat ? 'rgba(255, 100, 100, 0.9)' : 'rgba(100, 255, 100, 0.9)',
        color: 'black',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '400px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
          Terrain Verification
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Status:</strong> {terrainInfo.status}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Vertices:</strong> {terrainInfo.vertices.toLocaleString()}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Height Range:</strong> {terrainInfo.heightRange.min.toFixed(1)} to {terrainInfo.heightRange.max.toFixed(1)}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Variation:</strong> {heightVariation.toFixed(1)} units
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Vertex Colors:</strong> {terrainInfo.hasColors ? '✓ Yes' : '✗ No'}
        </div>
        {isFlat && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '4px' }}>
            <strong>⚠️ Warning:</strong> Terrain appears flat. Heightmap may not be loading correctly.
            <br />
            Check console for heightmap loading errors.
          </div>
        )}
      </div>
    </Html>
  )
}
