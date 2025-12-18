'use client'

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { INDUSTRIAL_LOCATIONS, IndustrialLocation } from '@/lib/terrain/coordinates'
import { latLngToWorld } from '@/lib/terrain/coordinates'

/**
 * Procedural 3D model components
 */

// Shipyard - Construction site with cranes
function ShipyardModel({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Main construction platform */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 4, 20]} />
        <meshStandardMaterial color={0x555555} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Crane 1 */}
      <group position={[-10, 0, -5]}>
        <mesh position={[0, 15, 0]} castShadow>
          <boxGeometry args={[1, 30, 1]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
        <mesh position={[0, 30, 0]} castShadow>
          <boxGeometry args={[8, 1, 1]} />
          <meshStandardMaterial color={0x666666} />
        </mesh>
        <mesh position={[4, 30, 0]} castShadow>
          <boxGeometry args={[1, 1, 6]} />
          <meshStandardMaterial color={0x777777} />
        </mesh>
      </group>
      
      {/* Crane 2 */}
      <group position={[10, 0, 5]}>
        <mesh position={[0, 12, 0]} castShadow>
          <boxGeometry args={[1, 24, 1]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
        <mesh position={[0, 24, 0]} castShadow>
          <boxGeometry args={[6, 1, 1]} />
          <meshStandardMaterial color={0x666666} />
        </mesh>
        <mesh position={[3, 24, 0]} castShadow>
          <boxGeometry args={[1, 1, 5]} />
          <meshStandardMaterial color={0x777777} />
        </mesh>
      </group>
      
      {/* Construction materials */}
      <mesh position={[-5, 1, 8]} castShadow>
        <boxGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color={0x8b7355} />
      </mesh>
      <mesh position={[5, 1, -8]} castShadow>
        <boxGeometry args={[5, 2, 3]} />
        <meshStandardMaterial color={0x654321} />
      </mesh>
    </group>
  )
}

// Vessel - Ship hull
function VesselModel({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Main hull */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[40, 4, 12]} />
        <meshStandardMaterial color={0x2c3e50} metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Bow (front) - tapered */}
      <mesh position={[-18, 1.5, 0]} castShadow>
        <coneGeometry args={[6, 8, 4]} />
        <meshStandardMaterial color={0x34495e} />
      </mesh>
      
      {/* Stern (back) */}
      <mesh position={[18, 2, 0]} castShadow>
        <boxGeometry args={[4, 3, 10]} />
        <meshStandardMaterial color={0x2c3e50} />
      </mesh>
      
      {/* Superstructure */}
      <mesh position={[8, 5, 0]} castShadow>
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color={0x34495e} />
      </mesh>
      
      {/* Mast */}
      <mesh position={[0, 12, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 12, 8]} />
        <meshStandardMaterial color={0x555555} />
      </mesh>
    </group>
  )
}

// Wind Turbine
function WindTurbineModel({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  const rotorRef = useRef<THREE.Group>(null)
  
  // Animate rotor rotation
  useEffect(() => {
    if (!rotorRef.current) return
    const animate = () => {
      if (rotorRef.current) {
        rotorRef.current.rotation.y += 0.01
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])
  
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Tower */}
      <mesh position={[0, 25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2, 50, 16]} />
        <meshStandardMaterial color={0xcccccc} metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Nacelle (housing at top) */}
      <mesh position={[0, 50, 0]} castShadow>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color={0x888888} />
      </mesh>
      
      {/* Rotor with 3 blades */}
      <group ref={rotorRef} position={[0, 50, 0]}>
        {/* Blade 1 */}
        <mesh position={[0, 0, 20]} rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 25]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0, 0, 20]} rotation={[0, Math.PI * 2 / 3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 25]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
        {/* Blade 3 */}
        <mesh position={[0, 0, 20]} rotation={[0, Math.PI * 4 / 3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 25]} />
          <meshStandardMaterial color={0xffffff} />
        </mesh>
      </group>
    </group>
  )
}

// Data Center Storage House
function DataCenterModel({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Main building */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 6, 15]} />
        <meshStandardMaterial color={0x4a5568} metalness={0.1} roughness={0.8} />
      </mesh>
      
      {/* Flat roof */}
      <mesh position={[0, 6.1, 0]} castShadow>
        <boxGeometry args={[20.2, 0.2, 15.2]} />
        <meshStandardMaterial color={0x2d3748} />
      </mesh>
      
      {/* Ventilation units on roof */}
      <mesh position={[-6, 7, -5]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color={0x718096} />
      </mesh>
      <mesh position={[6, 7, 5]} castShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color={0x718096} />
      </mesh>
      
      {/* Entrance */}
      <mesh position={[0, 1.5, 7.6]} castShadow>
        <boxGeometry args={[3, 3, 0.2]} />
        <meshStandardMaterial color={0x1a202c} />
      </mesh>
      
      {/* Windows */}
      {[-8, -4, 4, 8].map((x) => (
        <mesh key={x} position={[x, 4, 7.6]} castShadow>
          <boxGeometry args={[1.5, 2, 0.1]} />
          <meshStandardMaterial color={0x1a202c} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Component to handle terrain raycasting for a single industrial model
 */
function IndustrialModelWithTerrainSnap({
  location,
  index,
  terrainMesh
}: {
  location: IndustrialLocation
  index: number
  terrainMesh: THREE.Mesh | null
}) {
  const [yPosition, setYPosition] = useState(0)
  const raycaster = useRef(new THREE.Raycaster())

  // Raycast to terrain to get proper height
  useEffect(() => {
    if (!terrainMesh) return

    const [x, , z] = latLngToWorld(location.lat, location.lng)
    
    // Cast ray downward from above to find terrain height
    raycaster.current.set(
      new THREE.Vector3(x, 10000, z), // Start high above
      new THREE.Vector3(0, -1, 0)   // Cast downward
    )

    const intersects = raycaster.current.intersectObject(terrainMesh, false)
    if (intersects.length > 0) {
      setYPosition(intersects[0].point.y)
    } else {
      setYPosition(0)
    }
  }, [location, terrainMesh])

  const [x, , z] = latLngToWorld(location.lat, location.lng)
  const position: [number, number, number] = [x, yPosition, z]

  // Render based on type
  if (location.type === 'shipyard') {
    return (
      <ShipyardModel
        key={index}
        position={position}
        scale={location.scale || 1}
        rotation={location.rotation || 0}
      />
    )
  }

  if (location.type === 'vessel') {
    return (
      <VesselModel
        key={index}
        position={position}
        scale={location.scale || 1}
        rotation={location.rotation || 0}
      />
    )
  }

  if (location.type === 'windTurbine') {
    // For wind turbines, create multiple instances if count is specified
    const count = location.count || 1
    const spacing = 50 // 50 meters between turbines
    
    if (count > 1) {
      // Create grid of turbines
      const gridSize = Math.ceil(Math.sqrt(count))
      const startOffset = -(gridSize - 1) * spacing / 2
      
      return (
        <>
          {Array.from({ length: count }).map((_, i) => {
            const row = Math.floor(i / gridSize)
            const col = i % gridSize
            const offsetX = startOffset + col * spacing
            const offsetZ = startOffset + row * spacing
            return (
              <WindTurbineModel
                key={`${index}-${i}`}
                position={[x + offsetX, yPosition, z + offsetZ]}
                scale={location.scale || 1}
                rotation={location.rotation || 0}
              />
            )
          })}
        </>
      )
    }
    
    return (
      <WindTurbineModel
        key={index}
        position={position}
        scale={location.scale || 1}
        rotation={location.rotation || 0}
      />
    )
  }

  if (location.type === 'dataCenter') {
    // For data centers, create multiple buildings if count is specified
    const count = location.count || 1
    const spacing = 30 // 30 meters between buildings
    
    if (count > 1) {
      // Create grid of buildings
      const gridSize = Math.ceil(Math.sqrt(count))
      const startOffset = -(gridSize - 1) * spacing / 2
      
      return (
        <>
          {Array.from({ length: count }).map((_, i) => {
            const row = Math.floor(i / gridSize)
            const col = i % gridSize
            const offsetX = startOffset + col * spacing
            const offsetZ = startOffset + row * spacing
            return (
              <DataCenterModel
                key={`${index}-${i}`}
                position={[x + offsetX, yPosition, z + offsetZ]}
                scale={location.scale || 1}
                rotation={location.rotation || 0}
              />
            )
          })}
        </>
      )
    }
    
    return (
      <DataCenterModel
        key={index}
        position={position}
        scale={location.scale || 1}
        rotation={location.rotation || 0}
      />
    )
  }

  return null
}

/**
 * Main IndustrialModels component
 */
export default function IndustrialModels({
  locations = INDUSTRIAL_LOCATIONS,
  terrainMesh
}: {
  locations?: IndustrialLocation[]
  terrainMesh?: THREE.Mesh | null
}) {
  const [foundTerrain, setFoundTerrain] = useState<THREE.Mesh | null>(null)

  useEffect(() => {
    // Try global terrain ref first (set by Terrain component)
    if (typeof window !== 'undefined' && (window as any).__terrainMesh) {
      setFoundTerrain((window as any).__terrainMesh)
      
      // Update loading state - models are ready when terrain is found
      // Give a small delay to allow models to render
      setTimeout(() => {
        if ((window as any).__loadingState) {
          ;(window as any).__loadingState = {
            ...(window as any).__loadingState,
            models: { loaded: true, message: '3D models loaded ✓' }
          }
        }
      }, 1500)
    }
  }, [])

  const terrain = terrainMesh || foundTerrain

  return (
    <Suspense fallback={null}>
      {locations.map((location, index) => (
        <IndustrialModelWithTerrainSnap
          key={index}
          location={location}
          index={index}
          terrainMesh={terrain}
        />
      ))}
    </Suspense>
  )
}
