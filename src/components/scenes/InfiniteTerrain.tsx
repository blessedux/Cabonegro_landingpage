'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import LowPolyTerrain from './LowPolyTerrain'
import { TERRAIN_SIZE, TERRAIN_CENTER } from '@/lib/terrain/coordinates'
import { latLngToWorld } from '@/lib/terrain/coordinates'

interface InfiniteTerrainProps {
  heightmapUrl?: string
  terrainSize?: number
  decimationRatio?: number
  heightScale?: number
  fadeDistance?: number // Distance from center where fade starts (default: terrainSize * 0.4 = 40% of radius)
}

/**
 * InfiniteTerrain component that renders multiple terrain instances
 * in a 3x3 grid to create seamless infinite horizon effect with distance-based fade
 */
export default function InfiniteTerrain({
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  terrainSize = TERRAIN_SIZE,
  decimationRatio = 0.3,
  heightScale = 1500,
  fadeDistance = TERRAIN_SIZE * 0.4 // Start fading at 40% of terrain radius
}: InfiniteTerrainProps) {
  // Calculate center point in world coordinates
  const centerWorld = useMemo(() => {
    const [x, , z] = latLngToWorld(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng)
    return [x, z] as [number, number]
  }, [])

  // Create 3x3 grid of terrain instances
  // Grid layout:
  // [-1, -1] [0, -1] [1, -1]
  // [-1,  0] [0,  0] [1,  0]
  // [-1,  1] [0,  1] [1,  1]
  const terrainInstances = useMemo(() => {
    const instances: Array<{ offsetX: number; offsetZ: number; isCenter: boolean }> = []
    
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        instances.push({
          offsetX: x * terrainSize,
          offsetZ: z * terrainSize,
          isCenter: x === 0 && z === 0
        })
      }
    }
    
    return instances
  }, [terrainSize])

  return (
    <group>
      {terrainInstances.map((instance, index) => {
        // All instances fade based on distance from the main center
        // This creates a seamless infinite effect where only the center area is fully visible
        return (
          <group
            key={index}
            position={[instance.offsetX, 0, instance.offsetZ]}
          >
            <LowPolyTerrain
              heightmapUrl={heightmapUrl}
              terrainSize={terrainSize}
              decimationRatio={decimationRatio}
              heightScale={heightScale}
              fadeDistance={fadeDistance}
              terrainCenter={centerWorld} // All instances use main center for fade calculation
            />
          </group>
        )
      })}
    </group>
  )
}
