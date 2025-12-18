'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'
import { useAdaptiveQuality, QualityLevel } from '@/hooks/useAdaptiveQuality'

const QUALITY_TEXTURE_PATHS: Record<QualityLevel, string> = {
  low: '/assets/terrain/terrain-texture-low.png',
  medium: '/assets/terrain/terrain-texture-medium.png',
  ultra: '/assets/terrain/terrain-texture-ultra.png'
}

const QUALITY_LOAD_TIMEOUTS: Record<QualityLevel, number> = {
  low: 5000, // 5 seconds
  medium: 8000, // 8 seconds
  ultra: 12000 // 12 seconds
}

interface AdaptiveTerrainTextureProps {
  position?: [number, number, number]
  scale?: number | [number, number, number]
  rotation?: [number, number, number]
  receiveShadow?: boolean
  castShadow?: boolean
}

/**
 * AdaptiveTerrainTexture - Loads terrain texture with adaptive quality
 * Starts with low quality and upgrades to medium/ultra based on:
 * - Network bandwidth and latency
 * - Performance metrics (FPS, frame time)
 * - Load time
 */
export default function AdaptiveTerrainTexture({
  position = [0, 0, 0],
  scale,
  rotation = [-Math.PI / 2, 0, 0],
  receiveShadow = true,
  castShadow = false
}: AdaptiveTerrainTextureProps) {
  const { quality, networkMetrics, performanceMetrics } = useAdaptiveQuality()
  const meshRef = useRef<THREE.Mesh>(null)
  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(null)
  const [loadingQuality, setLoadingQuality] = useState<QualityLevel>('low')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const loadStartTime = useRef<number>(0)
  const upgradeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Start with low quality texture
  useEffect(() => {
    loadTexture('low')
  }, [])

  // Monitor quality changes and upgrade/downgrade accordingly
  useEffect(() => {
    // Clear any pending upgrade
    if (upgradeTimeoutRef.current) {
      clearTimeout(upgradeTimeoutRef.current)
      upgradeTimeoutRef.current = null
    }

    // If quality improved and we're not already loading that quality, upgrade
    if (quality !== loadingQuality && !isLoading) {
      const qualityOrder: QualityLevel[] = ['low', 'medium', 'ultra']
      const currentIndex = qualityOrder.indexOf(loadingQuality)
      const targetIndex = qualityOrder.indexOf(quality)

      // Only upgrade (not downgrade via this path - downgrade happens on timeout/error)
      if (targetIndex > currentIndex) {
        // Add a small delay to avoid rapid switching
        upgradeTimeoutRef.current = setTimeout(() => {
          loadTexture(quality)
        }, 500)
      }
    }
  }, [quality, loadingQuality, isLoading])

  const loadTexture = async (targetQuality: QualityLevel) => {
    const texturePath = QUALITY_TEXTURE_PATHS[targetQuality]
    const timeout = QUALITY_LOAD_TIMEOUTS[targetQuality]
    
    setIsLoading(true)
    setLoadError(false)
    loadStartTime.current = Date.now()
    setLoadingQuality(targetQuality)

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Texture load timeout after ${timeout}ms`))
        }, timeout)
      })

      // Load texture with timeout
      const texturePromise = new Promise<THREE.Texture>((resolve, reject) => {
        const loader = new THREE.TextureLoader()
        loader.load(
          texturePath,
          (texture) => {
            texture.wrapS = THREE.ClampToEdgeWrapping
            texture.wrapT = THREE.ClampToEdgeWrapping
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
            texture.colorSpace = THREE.SRGBColorSpace
            resolve(texture)
          },
          undefined,
          (error) => {
            reject(error)
          }
        )
      })

      const texture = await Promise.race([texturePromise, timeoutPromise])
      const loadTime = Date.now() - loadStartTime.current

      // Check if load time is acceptable
      if (loadTime > timeout * 0.8 && process.env.NODE_ENV === 'development') {
        console.warn(`[AdaptiveTerrainTexture] Load time (${loadTime}ms) is close to timeout, consider downgrading`)
      }

      // Dispose old texture
      if (currentTexture) {
        currentTexture.dispose()
      }

      setCurrentTexture(texture)
      setIsLoading(false)

    } catch (error) {
      console.error(`[AdaptiveTerrainTexture] Failed to load ${targetQuality} texture:`, error)
      setLoadError(true)
      setIsLoading(false)

      // Downgrade on error
      const qualityOrder: QualityLevel[] = ['low', 'medium', 'ultra']
      const currentIndex = qualityOrder.indexOf(targetQuality)
      if (currentIndex > 0) {
        const downgradeQuality = qualityOrder[currentIndex - 1]
        setTimeout(() => {
          loadTexture(downgradeQuality)
        }, 1000)
      }
    }
  }

  // Create geometry (simple plane)
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2, 1, 1)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  // Create material with current texture
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: currentTexture || undefined,
      roughness: 1.0,
      metalness: 0.0,
      color: currentTexture ? 0xffffff : 0x808080, // Grey fallback
    })
    return mat
  }, [currentTexture])

  // Update material when texture changes
  useEffect(() => {
    if (material && currentTexture) {
      const mat = material as THREE.MeshStandardMaterial
      if (mat.map !== currentTexture) {
        if (mat.map) {
          mat.map.dispose()
        }
        mat.map = currentTexture
        mat.needsUpdate = true
      }
    }
  }, [material, currentTexture])

  // Default scale: plane is 2 units, scale to TERRAIN_SIZE
  const defaultScale = TERRAIN_SIZE / 2
  const finalScale = scale !== undefined 
    ? (Array.isArray(scale) ? scale : [scale, scale, scale])
    : [defaultScale, 1, defaultScale]

  // Set global terrain mesh reference
  useEffect(() => {
    if (meshRef.current && typeof window !== 'undefined') {
      ;(window as any).__terrainMesh = meshRef.current
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__terrainMesh
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (upgradeTimeoutRef.current) {
        clearTimeout(upgradeTimeoutRef.current)
      }
      if (currentTexture) {
        currentTexture.dispose()
      }
      if (material) {
        material.dispose()
      }
      if (geometry) {
        geometry.dispose()
      }
    }
  }, [currentTexture, material, geometry])

  return (
    <group position={position} scale={finalScale} rotation={rotation}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        receiveShadow={receiveShadow}
        castShadow={castShadow}
      />
      {isLoading && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      )}
    </group>
  )
}
