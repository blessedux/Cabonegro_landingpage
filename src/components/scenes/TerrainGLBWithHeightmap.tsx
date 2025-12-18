'use client'

import { useGLTF } from '@react-three/drei'
import { useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

const QUALITY_TEXTURE_PATHS = {
  low: '/assets/terrain/terrain-texture-low.png',
  medium: '/assets/terrain/terrain-texture-medium.png',
  ultra: '/assets/terrain/terrain-texture-ultra.png'
}

/**
 * TerrainGLBWithHeightmap - Uses GLB texture with heightmap for correct elevation
 * Combines the correct texture from GLB with real heightmap data
 */
export default function TerrainGLBWithHeightmap({
  glbUrl = '/assets/models/terrain-tiles.glb',
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  position = [0, 0, 0],
  scale,
  rotation = [-Math.PI / 2, 0, 0],
  receiveShadow = true,
  castShadow = false,
  heightScale = 1500,
  segments = 256
}: {
  glbUrl?: string
  heightmapUrl?: string
  position?: [number, number, number]
  scale?: number | [number, number, number]
  rotation?: [number, number, number]
  receiveShadow?: boolean
  castShadow?: boolean
  heightScale?: number
  segments?: number
}) {
  const { scene } = useGLTF(glbUrl)
  const { quality } = useAdaptiveQuality()
  const [heightmapTexture, setHeightmapTexture] = useState<THREE.Texture | null>(null)
  const [terrainTexture, setTerrainTexture] = useState<THREE.Texture | null>(null)

  // Load heightmap
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      heightmapUrl,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        setHeightmapTexture(texture)
        console.log('[TerrainGLBWithHeightmap] ✓ Heightmap loaded')
      },
      undefined,
      (error) => {
        console.error('[TerrainGLBWithHeightmap] Failed to load heightmap:', error)
      }
    )
  }, [heightmapUrl])

  // Extract texture from GLB or load from terrain directory
  useEffect(() => {
    if (!scene) return

    // Try to extract texture from GLB first
    let extractedTexture: THREE.Texture | null = null
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        for (const mat of materials) {
          if (mat && typeof mat === 'object' && 'map' in mat) {
            const matAny = mat as any
            if (matAny.map instanceof THREE.Texture) {
              // Clone the texture to avoid issues
              extractedTexture = matAny.map.clone()
              extractedTexture.wrapS = THREE.ClampToEdgeWrapping
              extractedTexture.wrapT = THREE.ClampToEdgeWrapping
              extractedTexture.minFilter = THREE.LinearMipmapLinearFilter
              extractedTexture.magFilter = THREE.LinearFilter
              extractedTexture.generateMipmaps = true
              if ('colorSpace' in extractedTexture) {
                extractedTexture.colorSpace = THREE.SRGBColorSpace
              }
              console.log('[TerrainGLBWithHeightmap] ✓ Extracted texture from GLB:', {
                width: extractedTexture.image?.width || 'unknown',
                height: extractedTexture.image?.height || 'unknown'
              })
              break
            }
          }
        }
      }
    })

    // If we extracted texture from GLB, use it
    if (extractedTexture) {
      setTerrainTexture(extractedTexture)
    } else {
      // Otherwise, load from terrain directory with adaptive quality
      const texturePath = QUALITY_TEXTURE_PATHS[quality]
      
      const loader = new THREE.TextureLoader()
      loader.load(
        texturePath,
        (texture) => {
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.generateMipmaps = true
          texture.colorSpace = THREE.SRGBColorSpace
          setTerrainTexture(texture)
        },
        undefined,
        (error) => {
          console.error(`[TerrainGLBWithHeightmap] Failed to load terrain texture:`, error)
          // Try fallback to low quality
          if (quality !== 'low') {
            loader.load(
              QUALITY_TEXTURE_PATHS.low,
              (texture) => {
                texture.wrapS = THREE.ClampToEdgeWrapping
                texture.wrapT = THREE.ClampToEdgeWrapping
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                texture.colorSpace = THREE.SRGBColorSpace
                setTerrainTexture(texture)
                console.log('[TerrainGLBWithHeightmap] ✓ Fallback texture loaded (low quality)')
              },
              undefined,
              (error) => {
                console.error('[TerrainGLBWithHeightmap] Failed to load fallback texture:', error)
              }
            )
          }
        }
      )
    }
  }, [scene, quality])

  // Create geometry with heightmap displacement
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, segments, segments)
    geo.rotateX(-Math.PI / 2)
    
    // Apply heightmap displacement if available
    if (heightmapTexture && heightmapTexture.image) {
      const positions = geo.attributes.position
      const uvs = geo.attributes.uv
      
      // Create canvas to sample heightmap
      const canvas = document.createElement('canvas')
      canvas.width = heightmapTexture.image.width || 1024
      canvas.height = heightmapTexture.image.height || 1024
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(heightmapTexture.image, 0, 0)
        
        // Apply displacement to each vertex
        for (let i = 0; i < positions.count; i++) {
          const u = uvs.getX(i)
          const v = uvs.getY(i)
          
          // Sample heightmap (flip V coordinate)
          const imageData = ctx.getImageData(
            Math.floor(u * canvas.width),
            Math.floor((1 - v) * canvas.height),
            1,
            1
          )
          
          // Use red channel for height (grayscale image)
          const height = (imageData.data[0] / 255) * heightScale
          positions.setY(i, height)
        }
        
        positions.needsUpdate = true
        geo.computeVertexNormals()
      }
    }
    
    return geo
  }, [heightmapTexture, heightScale, segments])

  // Create material with terrain texture
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: terrainTexture || undefined,
      roughness: 1.0,
      metalness: 0.0,
      color: terrainTexture ? 0xffffff : 0x808080,
    })
    return mat
  }, [terrainTexture])

  // Update material when texture loads
  useEffect(() => {
    if (material && terrainTexture) {
      const mat = material as THREE.MeshStandardMaterial
      if (mat.map !== terrainTexture) {
        if (mat.map) {
          mat.map.dispose()
        }
        mat.map = terrainTexture
        mat.needsUpdate = true
      }
    }
  }, [material, terrainTexture])

  // Default scale: GLB plane is 2 units, scale to TERRAIN_SIZE
  const defaultScale = TERRAIN_SIZE / 2
  const finalScale = scale !== undefined 
    ? (Array.isArray(scale) ? scale : [scale, scale, scale])
    : [defaultScale, 1, defaultScale]

  // Expose mesh ref
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // We'll set this after mesh is created
    }
    return () => {
      delete (window as any).__terrainMesh
    }
  }, [])

  if (!scene || !geometry) {
    return null
  }

  return (
    <group position={position} scale={finalScale} rotation={rotation}>
      <mesh
        geometry={geometry}
        material={material}
        receiveShadow={receiveShadow}
        castShadow={castShadow}
        ref={(mesh) => {
          if (mesh && typeof window !== 'undefined') {
            ;(window as any).__terrainMesh = mesh
          }
        }}
      />
    </group>
  )
}


