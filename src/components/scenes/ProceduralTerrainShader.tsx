'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE, TERRAIN_CENTER } from '@/lib/terrain/coordinates'
import { loadSatelliteTexture } from '@/lib/terrain/map-tiles'

interface ProceduralTerrainShaderProps {
  heightmapUrl?: string
  heightScale?: number
  segments?: number
  terrainSize?: number
  roughness?: number
  metalness?: number
}

/**
 * Procedural Terrain with Shader-based Displacement
 * Uses actual heightmap data and satellite texture for realistic terrain rendering
 */
export default function ProceduralTerrainShader({
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  heightScale = 1500,
  segments = 500,
  terrainSize = TERRAIN_SIZE,
  roughness = 0.5,
  metalness = 0.0
}: ProceduralTerrainShaderProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [heightmapTexture, setHeightmapTexture] = useState<THREE.Texture | null>(null)
  const [satelliteTexture, setSatelliteTexture] = useState<THREE.Texture | null>(null)
  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef({ down: false, hover: false, prevPos: new THREE.Vector2() })

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
        console.log('[ProceduralTerrainShader] Heightmap loaded')
      },
      undefined,
      (error) => {
        console.error('[ProceduralTerrainShader] Failed to load heightmap:', error)
      }
    )
  }, [heightmapUrl])

  // Load satellite texture
  useEffect(() => {
    loadSatelliteTexture(4096, 13)
      .then((canvas) => {
        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.colorSpace = THREE.SRGBColorSpace
        setSatelliteTexture(texture)
        console.log('[ProceduralTerrainShader] Satellite texture loaded')
      })
      .catch((error) => {
        console.error('[ProceduralTerrainShader] Failed to load satellite texture:', error)
      })
  }, [])

  // Create shader material
  useEffect(() => {
    if (!heightmapTexture) return

    // Create a default texture if satellite texture isn't loaded yet
    const defaultTexture = new THREE.DataTexture(
      new Uint8Array([128, 128, 128, 255]),
      1,
      1,
      THREE.RGBAFormat
    )
    defaultTexture.needsUpdate = true

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        heightmap: { value: heightmapTexture },
        satelliteTexture: { value: satelliteTexture || defaultTexture },
        heightScale: { value: heightScale },
        terrainSize: { value: terrainSize },
        offset: { value: new THREE.Vector2(offsetRef.current.x, offsetRef.current.y) },
        useSatellite: { value: satelliteTexture ? 1.0 : 0.0 },
        roughness: { value: roughness },
        metalness: { value: metalness },
        time: { value: 0 },
        // Color uniforms for terrain zones
        colorSand: { value: new THREE.Color('#ffe894') },
        colorGrass: { value: new THREE.Color('#85d534') },
        colorSnow: { value: new THREE.Color('#ffffff') },
        colorRock: { value: new THREE.Color('#bfbd8d') },
      },
      vertexShader: `
        uniform sampler2D heightmap;
        uniform float heightScale;
        uniform float terrainSize;
        uniform vec2 offset;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;
        
        // Sample height from heightmap
        float sampleHeight(vec2 uv) {
          // Clamp UV to prevent sampling outside texture
          uv = clamp(uv, 0.0, 1.0);
          vec4 heightData = texture2D(heightmap, uv);
          // Use red channel for height (grayscale image)
          // Normalize from 0-1 range, then scale
          return heightData.r * heightScale;
        }
        
        void main() {
          vUv = uv;
          
          // Calculate world position with offset (similar to example)
          vec2 worldUv = uv;
          // Apply offset for panning
          vec2 offsetUv = offset / terrainSize;
          worldUv = worldUv + offsetUv;
          // Clamp to prevent sampling outside
          worldUv = clamp(worldUv, 0.0, 1.0);
          
          // Sample height from heightmap
          float height = sampleHeight(worldUv);
          vElevation = height;
          
          // Calculate position (similar to example's positionNode)
          vec3 pos = position;
          pos.y = height;
          
          // Calculate normal by sampling neighboring positions (like example)
          float normalLookUpShift = 0.01;
          
          // Neighbor positions (similar to example's neighborA and neighborB)
          vec2 neighborAUv = worldUv + vec2(normalLookUpShift, 0.0);
          vec2 neighborBUv = worldUv + vec2(0.0, -normalLookUpShift);
          
          neighborAUv = clamp(neighborAUv, 0.0, 1.0);
          neighborBUv = clamp(neighborBUv, 0.0, 1.0);
          
          vec3 neighborA = vec3(
            position.x + normalLookUpShift * terrainSize,
            sampleHeight(neighborAUv),
            position.z
          );
          
          vec3 neighborB = vec3(
            position.x,
            sampleHeight(neighborBUv),
            position.z - normalLookUpShift * terrainSize
          );
          
          // Compute normal using cross product (like example)
          vec3 toA = normalize(neighborA - pos);
          vec3 toB = normalize(neighborB - pos);
          vec3 normal = cross(toA, toB);
          
          vNormal = normal;
          // Store position with offset applied (like example's vPosition)
          vPosition = pos + vec3(offset.x, 0.0, offset.y);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D satelliteTexture;
        uniform float useSatellite;
        uniform float heightScale;
        uniform float roughness;
        uniform float metalness;
        uniform vec3 colorSand;
        uniform vec3 colorGrass;
        uniform vec3 colorSnow;
        uniform vec3 colorRock;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vec3 finalColor = colorSand;
          
          // If satellite texture is available, use it
          if (useSatellite > 0.5) {
            vec4 satelliteColor = texture2D(satelliteTexture, vUv);
            finalColor = satelliteColor.rgb;
            
            // Apply contrast and brightness enhancement
            finalColor = (finalColor - 0.5) * 1.4 + 0.5;
            finalColor = finalColor * 1.25;
          } else {
            // Procedural color based on elevation and slope (similar to example)
            
            // Grass zone (like example: step(-0.06, vPosition.y))
            // Convert elevation to relative position (normalize by heightScale)
            float normalizedElevation = vElevation / heightScale;
            float grassMix = step(-0.06, normalizedElevation);
            finalColor = mix(finalColor, colorGrass, grassMix);
            
            // Rock zone (steep slopes - like example)
            // Example: step(0.5, dot(vNormal, vec3(0, 1, 0))).oneMinus()
            float normalDotUp = dot(vNormal, vec3(0.0, 1.0, 0.0));
            float slope = 1.0 - normalDotUp;
            float rockMix = step(0.5, slope) * (1.0 - step(-0.06, normalizedElevation));
            finalColor = mix(finalColor, colorRock, rockMix);
            
            // Snow zone (high elevation - like example with noise variation)
            // Example uses: mx_noise_float(vPosition.xz.mul(25), 1, 0).mul(0.1).add(0.45)
            // For simplicity, we'll use a fixed threshold with slight variation
            float snowThreshold = 0.45;
            float snowMix = step(snowThreshold, normalizedElevation);
            finalColor = mix(finalColor, colorSnow, snowMix);
          }
          
          // Calculate lighting (similar to MeshStandardMaterial)
          vec3 lightDir = normalize(vec3(0.625, 0.3, 0.4)); // Similar to example's light position
          float NdotL = max(dot(vNormal, lightDir), 0.0);
          vec3 ambient = vec3(0.3);
          vec3 diffuse = finalColor * NdotL;
          vec3 color = ambient + diffuse;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.FrontSide,
      flatShading: false,
    })

    setMaterial(shaderMaterial)

    return () => {
      shaderMaterial.dispose()
      defaultTexture.dispose()
    }
  }, [heightmapTexture, satelliteTexture, heightScale, terrainSize, roughness, metalness])

  // Update material when satellite texture loads
  useEffect(() => {
    if (material && satelliteTexture) {
      material.uniforms.satelliteTexture.value = satelliteTexture
      material.uniforms.useSatellite.value = 1.0
      material.needsUpdate = true
    }
  }, [material, satelliteTexture])

  // Update uniforms
  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime
      material.uniforms.offset.value.set(offsetRef.current.x, offsetRef.current.y)
      material.uniforms.useSatellite.value = satelliteTexture ? 1.0 : 0.0
      if (satelliteTexture && material.uniforms.satelliteTexture) {
        material.uniforms.satelliteTexture.value = satelliteTexture
      }
    }
  })

  // Expose offset setter for drag controls
  useEffect(() => {
    if (meshRef.current && typeof window !== 'undefined') {
      ;(window as any).__terrainMesh = meshRef.current
      ;(window as any).__setTerrainOffset = (x: number, y: number) => {
        offsetRef.current.x = x
        offsetRef.current.y = y
      }
    }
  }, [])

  // Create geometry - exact match to example
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments)
    geo.rotateX(-Math.PI / 2)
    // Example deletes UVs and normals, but we need UVs for heightmap sampling
    // We'll keep UVs but the shader will handle everything
    return geo
  }, [terrainSize, segments])

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow castShadow />
  )
}
