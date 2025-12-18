'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'
import { createFallbackHeightmap } from '@/lib/terrain/heightmap-loader'
import { generateProceduralTerrainGeometry, generateTerrainTexture } from '@/lib/terrain/procedural-terrain'
import LowPolyTerrain from './LowPolyTerrain'

interface TerrainProps {
  heightmapUrl?: string
  segments?: number
  displacementScale?: number
  useLowPoly?: boolean // Enable low-poly mode for real terrain data
  lowPolyHeightmapUrl?: string // Specific heightmap for low-poly mode
}

export default function Terrain({
  heightmapUrl = '/assets/terrain/cabonegro-heightmap.png',
  segments = 256,
  displacementScale = 50,
  useLowPoly = false,
  lowPolyHeightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png'
}: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [heightmapTexture, setHeightmapTexture] = useState<THREE.Texture | null>(null)
  const [useProcedural, setUseProcedural] = useState(false)
  const [proceduralGeometry, setProceduralGeometry] = useState<THREE.PlaneGeometry | null>(null)
  const [proceduralTexture, setProceduralTexture] = useState<THREE.CanvasTexture | null>(null)
  
  // Expose mesh ref for terrain raycasting (used by Buildings component)
  useEffect(() => {
    if (meshRef.current) {
      ;(window as any).__terrainMesh = meshRef.current
    }
    return () => {
      delete (window as any).__terrainMesh
    }
  }, [])

  // Load heightmap with error handling
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
        setUseProcedural(false)
      },
      undefined,
      (error) => {
        console.warn('Heightmap not found, using procedural terrain:', error)
        // Generate procedural terrain instead of flat fallback
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          try {
            const { geometry, heightData } = generateProceduralTerrainGeometry(
              TERRAIN_SIZE,
              TERRAIN_SIZE,
              segments,
              segments,
              displacementScale
            )
            setProceduralGeometry(geometry)
            
            // Generate texture from height data
            const texture = generateTerrainTexture(heightData, segments + 1, segments + 1)
            setProceduralTexture(texture)
            setHeightmapTexture(texture)
            setUseProcedural(true)
          } catch (fallbackError) {
            console.error('Failed to create procedural terrain:', fallbackError)
            // Last resort: flat terrain
            setHeightmapTexture(createFallbackHeightmap())
            setUseProcedural(false)
          }
        }
      }
    )
  }, [heightmapUrl, segments, displacementScale])

  // Create terrain geometry - use procedural if available, otherwise standard
  const geometry = useMemo(() => {
    if (useProcedural && proceduralGeometry) {
      return proceduralGeometry
    }
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, segments, segments)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [segments, useProcedural, proceduralGeometry])

  // Create material - use texture if procedural, displacement if heightmap
  const material = useMemo(() => {
    if (useProcedural && proceduralTexture) {
      // Procedural terrain uses texture directly (height is in geometry)
      return new THREE.MeshStandardMaterial({
        map: proceduralTexture,
        roughness: 0.8,
        metalness: 0.1,
      })
    }

    // Heightmap-based terrain uses displacement
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4a5c3a, // Green-brown terrain color
      roughness: 0.8,
      metalness: 0.1,
    })

    // Update displacement map if texture is available
    if (heightmapTexture) {
      mat.displacementMap = heightmapTexture
      mat.displacementScale = displacementScale
      mat.displacementBias = 0
      mat.needsUpdate = true
    }

    return mat
  }, [heightmapTexture, displacementScale, useProcedural, proceduralTexture])

  // LOD disabled temporarily - can be re-enabled once React property issues are resolved
  // useFrame(() => {
  //   if (!meshRef.current || !camera) return
  //   const distance = camera.position.distanceTo(meshRef.current.position)
  //   // ... LOD logic
  // })

  // Use LowPolyTerrain if low-poly mode is enabled
  if (useLowPoly) {
    return (
      <LowPolyTerrain
        heightmapUrl={lowPolyHeightmapUrl}
        terrainSize={TERRAIN_SIZE}
        decimationRatio={0.6}
        heightScale={displacementScale}
      />
    )
  }

  // Always render terrain, even while loading (with fallback material)
  // This prevents the green gradient background from showing
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={true}
      receiveShadow={true}
      position={[0, 0, 0]}
    />
  )
}
