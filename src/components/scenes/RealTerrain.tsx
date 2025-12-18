'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE, TERRAIN_CENTER } from '@/lib/terrain/coordinates'
import { loadHeightmapAsLowPoly } from '@/lib/terrain/low-poly-processor'
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality'

interface RealTerrainProps {
  heightmapUrl?: string
  terrainSize?: number
  decimationRatio?: number
  heightScale?: number
  fadeDistance?: number
  terrainCenter?: [number, number]
}

const QUALITY_TEXTURE_PATHS = {
  low: '/assets/terrain/terrain-texture-low.png',
  medium: '/assets/terrain/terrain-texture-medium.png',
  ultra: '/assets/terrain/terrain-texture-ultra.png'
}

/**
 * RealTerrain - Uses real heightmap and pre-generated terrain texture
 * Matches sizes correctly and uses no mock/fake data
 */
export default function RealTerrain({
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  terrainSize = TERRAIN_SIZE,
  decimationRatio = 0.3,
  heightScale = 1500,
  fadeDistance = 0,
  terrainCenter = [0, 0]
}: RealTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [terrainTexture, setTerrainTexture] = useState<THREE.Texture | null>(null)
  const { quality } = useAdaptiveQuality()

  // Expose mesh ref for terrain raycasting
  useEffect(() => {
    if (meshRef.current && geometry) {
      ;(window as any).__terrainMesh = meshRef.current
    }
    return () => {
      delete (window as any).__terrainMesh
    }
  }, [geometry])

  // Load real heightmap
  useEffect(() => {
    setIsLoading(true)
    
    loadHeightmapAsLowPoly(heightmapUrl, terrainSize, decimationRatio, heightScale)
      .then(({ geometry: geo }) => {
        setGeometry(geo)
        setIsLoading(false)
        console.log('[RealTerrain] ✓ Heightmap loaded and geometry created')
      })
      .catch((error) => {
        console.error('[RealTerrain] Failed to load heightmap:', error)
        // Create flat fallback
        const fallbackGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 16, 16)
        fallbackGeo.rotateX(-Math.PI / 2)
        setGeometry(fallbackGeo)
        setIsLoading(false)
      })
  }, [heightmapUrl, terrainSize, decimationRatio, heightScale])

  // Load real terrain texture (adaptive quality)
  useEffect(() => {
    const texturePath = QUALITY_TEXTURE_PATHS[quality]
    
    const loader = new THREE.TextureLoader()
    loader.load(
      texturePath,
      (texture) => {
        // Texture covers ~3.45km area, terrain is 80km
        // Use ClampToEdge so texture shows in center area and doesn't repeat
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
        console.error(`[RealTerrain] Failed to load terrain texture:`, error)
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
              console.log('[RealTerrain] ✓ Fallback texture loaded (low quality)')
            },
            undefined,
            (error) => {
              console.error('[RealTerrain] Failed to load fallback texture:', error)
            }
          )
        }
      }
    )
  }, [quality])

  // Calculate height range for shader
  const heightRange = useMemo(() => {
    if (!geometry) return { min: 0, max: 1000 }
    
    const positions = geometry.attributes.position?.array as Float32Array
    if (!positions || positions.length === 0) return { min: 0, max: 1000 }
    
    let minY = Infinity
    let maxY = -Infinity
    
    for (let i = 1; i < positions.length; i += 3) {
      const y = positions[i]
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    
    return { min: isFinite(minY) ? minY : 0, max: isFinite(maxY) ? maxY : 1000 }
  }, [geometry])

  // Create material with real texture
  const material = useMemo(() => {
    if (!geometry) {
      return new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0,
      })
    }

    // Default black texture if terrain texture isn't loaded yet
    const defaultTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 255]),
      1,
      1,
      THREE.RGBAFormat
    )
    defaultTexture.needsUpdate = true

    const textureToUse = terrainTexture || defaultTexture

    // Create shader material with real terrain texture
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        terrainTexture: { value: textureToUse },
        minHeight: { value: heightRange.min },
        maxHeight: { value: heightRange.max },
        useTexture: { value: terrainTexture ? 1.0 : 0.0 },
        fadeDistance: { value: fadeDistance },
        terrainCenter: { value: new THREE.Vector2(terrainCenter[0], terrainCenter[1]) },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;
        varying float vDistanceFromCenter;
        
        uniform float fadeDistance;
        uniform vec2 terrainCenter;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vElevation = position.y;
          
          // Calculate distance from center for fade
          vec2 centerPos = vec2(position.x, position.z);
          vec2 center = terrainCenter;
          vDistanceFromCenter = length(centerPos - center);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D terrainTexture;
        uniform float useTexture;
        uniform float minHeight;
        uniform float maxHeight;
        uniform float fadeDistance;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;
        varying float vDistanceFromCenter;
        
        void main() {
          vec3 finalColor = vec3(0.3, 0.35, 0.25); // Default terrain color
          
          // Use real terrain texture if available
          if (useTexture > 0.5) {
            // Sample texture - UV coordinates are already mapped to terrain size
            // The texture will repeat if it's smaller than the terrain
            vec4 textureColor = texture2D(terrainTexture, vUv);
            finalColor = textureColor.rgb;
            
            // Enhance contrast and brightness for better visibility
            finalColor = (finalColor - 0.5) * 1.2 + 0.5;
            finalColor = finalColor * 1.1;
            finalColor = clamp(finalColor, 0.0, 1.0);
          } else {
            // Fallback: elevation-based coloring
            float normalizedHeight = (vElevation - minHeight) / (maxHeight - minHeight);
            normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);
            
            vec3 lowColor = vec3(0.3, 0.35, 0.25);
            vec3 midColor = vec3(0.5, 0.55, 0.45);
            vec3 highColor = vec3(0.7, 0.7, 0.65);
            
            if (normalizedHeight < 0.5) {
              finalColor = mix(lowColor, midColor, normalizedHeight * 2.0);
            } else {
              finalColor = mix(midColor, highColor, (normalizedHeight - 0.5) * 2.0);
            }
          }
          
          // Calculate fade opacity based on distance from center
          float opacity = 1.0;
          if (fadeDistance > 0.0) {
            float fadeStart = fadeDistance;
            float fadeEnd = fadeDistance * 1.5;
            if (vDistanceFromCenter > fadeStart) {
              float fadeRange = fadeEnd - fadeStart;
              float fadeProgress = (vDistanceFromCenter - fadeStart) / fadeRange;
              opacity = 1.0 - clamp(fadeProgress, 0.0, 1.0);
            }
          }
          
          // Lighting
          vec3 lightDir = normalize(vec3(0.625, 0.3, 0.4));
          float NdotL = max(dot(vNormal, lightDir), 0.0);
          vec3 ambient = vec3(0.4);
          vec3 diffuse = finalColor * NdotL;
          vec3 color = ambient + diffuse;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      side: THREE.FrontSide,
      transparent: fadeDistance > 0,
    })

    return shaderMaterial
  }, [geometry, terrainTexture, heightRange, fadeDistance, terrainCenter])

  // Update material when texture loads
  useEffect(() => {
    if (material && terrainTexture && material instanceof THREE.ShaderMaterial) {
      material.uniforms.terrainTexture.value = terrainTexture
      material.uniforms.useTexture.value = 1.0
      material.needsUpdate = true
    }
  }, [material, terrainTexture])

  // Fallback geometry while loading
  const displayGeometry = useMemo(() => {
    if (geometry) return geometry
    
    const fallback = new THREE.PlaneGeometry(terrainSize, terrainSize, 32, 32)
    fallback.rotateX(-Math.PI / 2)
    return fallback
  }, [geometry, terrainSize])

  return (
    <mesh
      ref={meshRef}
      geometry={displayGeometry}
      material={material}
      receiveShadow
      castShadow={false}
    />
  )
}
