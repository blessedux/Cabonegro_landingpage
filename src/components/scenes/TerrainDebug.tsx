'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Debug component to log terrain and camera information
 */
export default function TerrainDebug() {
  const { camera, scene } = useThree()

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[TerrainDebug] Scene initialized:', {
        cameraPosition: camera.position.toArray(),
        cameraRotation: camera.rotation.toArray(),
        sceneChildren: scene.children.length,
        terrainMesh: (window as any).__terrainMesh ? 'Found' : 'Not found'
      })

      // Check for terrain mesh
      const terrainMesh = (window as any).__terrainMesh
      if (terrainMesh) {
        console.log('[TerrainDebug] Terrain mesh found:', {
          position: terrainMesh.position.toArray(),
          geometry: terrainMesh.geometry ? {
            vertices: terrainMesh.geometry.attributes.position?.count || 0,
            hasColors: !!terrainMesh.geometry.attributes.color
          } : 'No geometry',
          material: terrainMesh.material ? {
            type: terrainMesh.material.type,
            flatShading: (terrainMesh.material as any).flatShading,
            vertexColors: (terrainMesh.material as any).vertexColors
          } : 'No material'
        })
      } else {
        console.warn('[TerrainDebug] Terrain mesh not found in window.__terrainMesh')
      }
    }
  }, [camera, scene])

  return null
}
