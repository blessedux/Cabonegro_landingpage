'use client'

import { useEffect, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { CAMERA_WAYPOINTS, CameraWaypoint } from '@/lib/terrain/coordinates'
import { latLngToWorld } from '@/lib/terrain/coordinates'

/**
 * Camera waypoint navigation controller (inside Canvas)
 * Handles camera animations to waypoints
 */
export function CameraWaypointController() {
  const { camera } = useThree()
  const isAnimating = useRef(false)
  const terrainMeshRef = useRef<THREE.Mesh | null>(null)

  // Get terrain mesh reference
  useEffect(() => {
    const checkTerrain = () => {
      if (typeof window !== 'undefined' && (window as any).__terrainMesh) {
        terrainMeshRef.current = (window as any).__terrainMesh
      }
    }
    checkTerrain()
    const interval = setInterval(checkTerrain, 500)
    return () => clearInterval(interval)
  }, [])

  // Raycast to get terrain height
  const getTerrainHeight = (x: number, z: number): number => {
    if (!terrainMeshRef.current) return 0
    
    const raycaster = new THREE.Raycaster()
    raycaster.set(
      new THREE.Vector3(x, 10000, z), // Start high above
      new THREE.Vector3(0, -1, 0)    // Cast downward
    )
    
    const intersects = raycaster.intersectObject(terrainMeshRef.current, false)
    return intersects.length > 0 ? intersects[0].point.y : 0
  }

  // Animate camera to waypoint
  const navigateToWaypoint = (waypoint: CameraWaypoint) => {
    if (isAnimating.current || !camera) return
    
    isAnimating.current = true
    
    // Convert lat/lng to world coordinates
    const [posX, , posZ] = latLngToWorld(waypoint.position.lat, waypoint.position.lng)
    const [lookX, , lookZ] = latLngToWorld(waypoint.lookAt.lat, waypoint.lookAt.lng)
    
    // Get terrain height at position
    const terrainHeight = getTerrainHeight(posX, posZ)
    const targetY = terrainHeight + waypoint.position.altitude
    
    const targetPosition = new THREE.Vector3(posX, targetY, posZ)
    const targetLookAt = new THREE.Vector3(lookX, terrainHeight, lookZ)
    
    const duration = waypoint.duration || 3
    
    // Animate camera position
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Keep camera at correct height above terrain during animation
        const currentTerrainHeight = getTerrainHeight(camera.position.x, camera.position.z)
        const minHeight = currentTerrainHeight + 100 // Minimum 100m above terrain
        if (camera.position.y < minHeight) {
          camera.position.y = minHeight
        }
        
        // Smoothly look at target during animation
        const progress = gsap.getProperty(camera.position, 'x') as number
        const t = Math.min(1, progress / duration)
        const currentLookAt = new THREE.Vector3().lerpVectors(
          new THREE.Vector3(camera.position.x, currentTerrainHeight, camera.position.z),
          targetLookAt,
          t
        )
        camera.lookAt(currentLookAt)
      },
      onComplete: () => {
        // Final look-at
        camera.lookAt(targetLookAt)
        isAnimating.current = false
      }
    })
  }

  // Expose navigation function globally for UI
  useEffect(() => {
    ;(window as any).navigateToCameraWaypoint = navigateToWaypoint
    ;(window as any).isCameraAnimating = () => isAnimating.current
    
    return () => {
      delete (window as any).navigateToCameraWaypoint
      delete (window as any).isCameraAnimating
    }
  }, [camera])

  return null
}

/**
 * Camera waypoints UI overlay (outside Canvas)
 * Displays clickable waypoint buttons
 */
export default function CameraWaypoints() {
  const [activeWaypoint, setActiveWaypoint] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const checkAnimation = () => {
      if (typeof window !== 'undefined' && (window as any).isCameraAnimating) {
        setIsAnimating((window as any).isCameraAnimating())
      }
    }
    const interval = setInterval(checkAnimation, 100)
    return () => clearInterval(interval)
  }, [])

  const handleWaypointClick = (waypoint: CameraWaypoint) => {
    if (isAnimating) return
    
    setActiveWaypoint(waypoint.name)
    setIsAnimating(true)
    
    if (typeof window !== 'undefined' && (window as any).navigateToCameraWaypoint) {
      ;(window as any).navigateToCameraWaypoint(waypoint)
      
      // Reset animation state after duration
      setTimeout(() => {
        setIsAnimating(false)
        setActiveWaypoint(null)
      }, (waypoint.duration || 3) * 1000 + 500)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm font-medium mr-2">Navigate to:</span>
          {CAMERA_WAYPOINTS.map((waypoint) => (
            <button
              key={waypoint.name}
              onClick={() => handleWaypointClick(waypoint)}
              disabled={isAnimating}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all
                ${
                  activeWaypoint === waypoint.name
                    ? 'bg-blue-600 text-white'
                    : isAnimating
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }
              `}
              title={waypoint.description}
            >
              {waypoint.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
