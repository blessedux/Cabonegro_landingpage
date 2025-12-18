'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { latLngToWorld } from '@/lib/terrain/coordinates'

interface BuildingPosition {
  lat: number
  lng: number
  modelUrl?: string
  scale?: number
  rotation?: number
  name?: string
}

// Default building positions (can be expanded)
const DEFAULT_BUILDINGS: BuildingPosition[] = [
  {
    lat: -52.937139,
    lng: -70.849639,
    scale: 1,
    rotation: 0,
    name: 'Main Terminal'
  },
  // Add more building positions as needed
]

interface BuildingModelProps {
  position: [number, number, number]
  modelUrl?: string
  scale?: number
  rotation?: number
}

function BuildingModelWithGLTF({ position, modelUrl, scale = 1, rotation = 0 }: BuildingModelProps & { modelUrl: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(modelUrl)

  // Ensure scene is properly initialized before using
  if (!scene) return null

  // Use the scene directly - R3F will handle it properly
  // Note: If you need multiple instances of the same model, consider using instancing
  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0, rotation, 0]}>
      <primitive object={scene} dispose={null} />
    </group>
  )
}

function BuildingPlaceholder({ position, scale = 1, rotation = 0 }: BuildingModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0, rotation, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[10, 20, 10]} />
        <meshStandardMaterial color={0x8b7355} />
      </mesh>
      {/* Simple roof */}
      <mesh position={[0, 12, 0]} castShadow>
        <coneGeometry args={[8, 5, 4]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>
    </group>
  )
}

// Component to handle terrain raycasting for a single building
function BuildingWithTerrainSnap({
  building,
  index,
  terrainMesh
}: {
  building: BuildingPosition
  index: number
  terrainMesh: THREE.Mesh | null
}) {
  const [yPosition, setYPosition] = useState(0)
  const raycaster = useRef(new THREE.Raycaster())

  // Raycast to terrain to get proper height
  useEffect(() => {
    if (!terrainMesh) return

        const [x, , z] = latLngToWorld(building.lat, building.lng)
    
    // Cast ray downward from above to find terrain height
    raycaster.current.set(
      new THREE.Vector3(x, 1000, z), // Start high above
      new THREE.Vector3(0, -1, 0)   // Cast downward
    )

    const intersects = raycaster.current.intersectObject(terrainMesh, false)
    if (intersects.length > 0) {
      setYPosition(intersects[0].point.y + 1) // Add 1m offset above terrain
    } else {
      // Fallback: use default height
      setYPosition(0)
    }
  }, [building, terrainMesh])

  const [x, , z] = latLngToWorld(building.lat, building.lng)

        return building.modelUrl ? (
          <BuildingModelWithGLTF
            key={index}
      position={[x, yPosition, z]}
            modelUrl={building.modelUrl}
            scale={building.scale}
            rotation={building.rotation}
          />
        ) : (
          <BuildingPlaceholder
            key={index}
      position={[x, yPosition, z]}
            scale={building.scale}
            rotation={building.rotation}
          />
        )
}

export default function Buildings({ 
  buildings = DEFAULT_BUILDINGS,
  terrainMesh
}: { 
  buildings?: BuildingPosition[]
  terrainMesh?: THREE.Mesh | null
}) {
  // Find terrain mesh - try passed prop first, then global ref
  const [foundTerrain, setFoundTerrain] = useState<THREE.Mesh | null>(null)

  useEffect(() => {
    // Try global terrain ref first (set by Terrain component)
    if (typeof window !== 'undefined' && (window as any).__terrainMesh) {
      setFoundTerrain((window as any).__terrainMesh)
    }
  }, [])

  const terrain = terrainMesh || foundTerrain

  return (
    <Suspense fallback={null}>
      {buildings.map((building, index) => (
        <BuildingWithTerrainSnap
          key={index}
          building={building}
          index={index}
          terrainMesh={terrain}
        />
      ))}
    </Suspense>
  )
}

// Preload models (optional optimization)
// useGLTF.preload('/assets/models/buildings/building.gltf')
