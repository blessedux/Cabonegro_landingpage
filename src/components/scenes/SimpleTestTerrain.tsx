'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'

/**
 * Simple test terrain to verify rendering works
 * This creates a visible terrain with height variation
 */
export default function SimpleTestTerrain() {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 64, 64)
    geo.rotateX(-Math.PI / 2)
    
    // Add height variation
    const positions = geo.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      // Create visible hills/valleys
      positions[i + 1] = Math.sin(x * 0.002) * Math.cos(z * 0.002) * 500 + 
                        Math.sin(x * 0.005) * 200
    }
    geo.attributes.position.needsUpdate = true
    geo.computeVertexNormals()
    
    console.log('[SimpleTestTerrain] Created test terrain with', positions.length / 3, 'vertices')
    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x90EE90, // Bright green so it's very visible
      flatShading: true,
      roughness: 0.7,
      metalness: 0.1,
    })
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]}
      receiveShadow={true}
      castShadow={true}
    />
  )
}
