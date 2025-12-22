'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { latLngToWorld } from '@/lib/terrain/coordinates'

interface SatelliteOrbitCameraProps {
  /**
   * Latitude of the target point (light beam base)
   */
  targetLat?: number
  /**
   * Longitude of the target point (light beam base)
   */
  targetLng?: number
  /**
   * Orbital altitude in meters (satellite height above terrain)
   */
  altitude?: number
  /**
   * Orbital radius in meters (distance from target center)
   */
  orbitalRadius?: number
  /**
   * Orbital speed (radians per second)
   */
  orbitalSpeed?: number
  /**
   * Whether the satellite orbit is active
   */
  enabled?: boolean
  /**
   * Initial orbital angle (in radians)
   */
  initialAngle?: number
}

/**
 * Satellite orbital camera controller
 * Makes the camera orbit around a target point (light beam base) like a satellite,
 * always pointing down at the target
 */
export default function SatelliteOrbitCamera({
  targetLat = -52.937139, // Light beam base coordinates
  targetLng = -70.849639,
  altitude = 50000, // 50km altitude (satellite height)
  orbitalRadius = 20000, // 20km orbital radius
  orbitalSpeed = 0.1, // Slow orbital motion
  enabled = false,
  initialAngle = 0
}: SatelliteOrbitCameraProps) {
  const { camera } = useThree()
  const angleRef = useRef(initialAngle)
  const isActiveRef = useRef(false)
  const targetPositionRef = useRef<THREE.Vector3 | null>(null)
  const terrainHeightRef = useRef(0)

  // Convert target lat/lng to world coordinates
  useEffect(() => {
    const [x, , z] = latLngToWorld(targetLat, targetLng)
    
    // Get terrain height at target position
    const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
    if (terrainMesh) {
      const raycaster = new THREE.Raycaster()
      raycaster.set(
        new THREE.Vector3(x, 1000, z),
        new THREE.Vector3(0, -1, 0)
      )
      const intersects = raycaster.intersectObject(terrainMesh, false)
      if (intersects.length > 0) {
        terrainHeightRef.current = intersects[0].point.y
      }
    }
    
    targetPositionRef.current = new THREE.Vector3(x, terrainHeightRef.current, z)
  }, [targetLat, targetLng])

  // Enable/disable satellite orbit
  useEffect(() => {
    // Check both prop and window variable set by SceneSequenceController
    if (typeof window !== 'undefined') {
      const windowEnabled = (window as any).__enableSatelliteOrbit === true
      isActiveRef.current = enabled || windowEnabled
    } else {
      isActiveRef.current = enabled
    }
    
    if (!isActiveRef.current) {
      angleRef.current = initialAngle
    }
  }, [enabled, initialAngle])

  // Animate camera in orbital path
  useFrame((state, delta) => {
    // Check window variable for real-time updates
    if (typeof window !== 'undefined') {
      const windowEnabled = (window as any).__enableSatelliteOrbit === true
      if (windowEnabled !== isActiveRef.current) {
        isActiveRef.current = windowEnabled
        if (!windowEnabled) {
          angleRef.current = initialAngle
          return
        }
      }
    }
    
    if (!isActiveRef.current || !targetPositionRef.current) return

    // Update orbital angle
    angleRef.current += orbitalSpeed * delta

    // Calculate camera position in circular orbit
    const cameraX = targetPositionRef.current.x + Math.cos(angleRef.current) * orbitalRadius
    const cameraZ = targetPositionRef.current.z + Math.sin(angleRef.current) * orbitalRadius
    const cameraY = terrainHeightRef.current + altitude

    // Set camera position
    camera.position.set(cameraX, cameraY, cameraZ)

    // Always look down at the target point
    camera.lookAt(targetPositionRef.current)
  })

  return null // This component doesn't render anything
}

