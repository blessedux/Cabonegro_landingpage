'use client'

import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'

/**
 * TerrainGLB - Simple GLB terrain loader
 * Loads and renders the GLB terrain model with minimal processing
 */
export default function TerrainGLB({
  url = '/assets/models/terrain-tiles.glb',
  position = [0, 0, 0],
  scale,
  rotation = [-Math.PI / 2, 0, 0],
  receiveShadow = true,
  castShadow = false
}: {
  url?: string
  position?: [number, number, number]
  scale?: number | [number, number, number]
  rotation?: [number, number, number]
  receiveShadow?: boolean
  castShadow?: boolean
}) {
  const { scene } = useGLTF(url)

  if (!scene) {
    return null
  }

  // Process scene: clone and replace materials to avoid uniform errors
  const processedScene = useMemo(() => {
    const clone = scene.clone()
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = receiveShadow
        child.castShadow = castShadow
        
        // Replace material completely to avoid uniform errors
        if (child.material) {
          const oldMaterials = Array.isArray(child.material) ? child.material : [child.material]
          const newMaterials = oldMaterials.map((oldMat) => {
            // Extract texture
            let texture: THREE.Texture | null = null
            if (oldMat && typeof oldMat === 'object' && 'map' in oldMat) {
              const matAny = oldMat as any
              if (matAny.map instanceof THREE.Texture) {
                texture = matAny.map.clone()
                if ('colorSpace' in texture) {
                  texture.colorSpace = THREE.SRGBColorSpace
                }
              }
            }
            
            // Create completely new material with all uniforms initialized
            const newMat = new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 1.0,
              metalness: 0.0,
              color: 0xffffff,
            })
            
            // Dispose old material
            if (oldMat && typeof oldMat.dispose === 'function') {
              try {
                oldMat.dispose()
              } catch (e) {
                // Ignore
              }
            }
            
            return newMat
          })
          
          child.material = newMaterials.length === 1 ? newMaterials[0] : newMaterials
        }
      }
    })
    
    // Set global terrain mesh reference
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && typeof window !== 'undefined') {
        ;(window as any).__terrainMesh = child
        return
      }
    })
    
    return clone
  }, [scene, receiveShadow, castShadow])

  // Default scale: GLB plane is 2 units, scale to TERRAIN_SIZE
  const defaultScale = TERRAIN_SIZE / 2
  const finalScale = scale !== undefined 
    ? (Array.isArray(scale) ? scale : [scale, scale, scale])
    : [defaultScale, 1, defaultScale]

  return (
    <group position={position} scale={finalScale} rotation={rotation}>
      <primitive object={processedScene} />
    </group>
  )
}

// Preload disabled - GLB causes material uniform errors
// if (typeof window !== 'undefined') {
//   useGLTF.preload('/assets/models/terrain-tiles.glb')
// }
