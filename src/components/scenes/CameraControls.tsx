'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { TERRAIN_SIZE } from '@/lib/terrain/coordinates'

interface CameraWaypoint {
  position: [number, number, number]
  lookAt: [number, number, number]
  name?: string
  description?: string
}

// Height constants
const DEFAULT_HOVER_HEIGHT = 2000 // Default 2000 meters above ground to see more area
const MIN_HEIGHT = 100 // Minimum 100 meters above ground (for close detail)
const MAX_HEIGHT = 40000 // Maximum 40km above ground (to see entire 80km terrain)
const MIN_PITCH = -Math.PI / 2 // -90 degrees (straight down)
const MAX_PITCH = 0 // 0 degrees (horizon level)

// Default camera waypoints - centered on terrain center point
const DEFAULT_WAYPOINTS: CameraWaypoint[] = [
  {
    position: [0, DEFAULT_HOVER_HEIGHT, 0], // Center of terrain, default height above ground
    lookAt: [0, 0, 0], // Look at ground center
    name: 'Center View',
    description: 'Overview of 40km area around 53°03\'40.4"S 70°52\'42.2"W'
  },
]

interface CameraControlsProps {
  enableFreeFlight?: boolean
  enableGuidedTour?: boolean
  waypoints?: CameraWaypoint[]
  onWaypointReached?: (waypoint: CameraWaypoint, index: number) => void
}

export default function CameraControls({
  enableFreeFlight = true,
  enableGuidedTour = true,
  waypoints = DEFAULT_WAYPOINTS,
  onWaypointReached
}: CameraControlsProps) {
  const { camera, gl, scene } = useThree()
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0)
  const [isTouring, setIsTouring] = useState(false)
  const [isFreeFlight, setIsFreeFlight] = useState(enableFreeFlight)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // FPS-style controls
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  })
  const moveSpeed = 100 // Horizontal movement speed
  const verticalSpeed = 200 // Vertical movement speed (faster for altitude changes)
  const currentHoverHeight = useRef(DEFAULT_HOVER_HEIGHT) // Current hover height above terrain
  
  // Mouse controls for rotation
  const isPointerLocked = useRef(false)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const sensitivity = 0.002 // Mouse sensitivity
  
  // Raycaster for terrain height detection
  const raycaster = useRef(new THREE.Raycaster())
  const terrainMeshRef = useRef<THREE.Mesh | null>(null)

  // Get terrain mesh reference
  useEffect(() => {
    const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
    if (terrainMesh) {
      terrainMeshRef.current = terrainMesh
    }
    
    // Also try to find it in the scene
    const checkScene = () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry && child.material) {
          // Check if it's likely the terrain (large plane geometry)
          const geo = child.geometry as THREE.BufferGeometry
          if (geo.attributes.position && geo.attributes.position.count > 1000) {
            terrainMeshRef.current = child
          }
        }
      })
    }
    
    // Check after a short delay to ensure terrain is loaded
    const timeout = setTimeout(checkScene, 1000)
    return () => clearTimeout(timeout)
  }, [scene])

  // Get terrain height at a given x, z position
  const getTerrainHeight = useCallback((x: number, z: number): number => {
    if (!terrainMeshRef.current) return 0
    
    // Cast ray downward from above to find terrain height
    raycaster.current.set(
      new THREE.Vector3(x, 1000, z), // Start high above
      new THREE.Vector3(0, -1, 0)   // Cast downward
    )

    const intersects = raycaster.current.intersectObject(terrainMeshRef.current, false)
    if (intersects.length > 0) {
      return intersects[0].point.y
    }
    
    return 0 // Fallback to sea level
  }, [])

  // Initialize camera position once on mount
  useEffect(() => {
    if (waypoints.length > 0 && camera && !isInitialized) {
      const firstWaypoint = waypoints[0]
      const targetPos = new THREE.Vector3(...firstWaypoint.position)
      
      // Get terrain height at center
      const terrainHeight = getTerrainHeight(0, 0)
      currentHoverHeight.current = DEFAULT_HOVER_HEIGHT
      targetPos.y = terrainHeight + currentHoverHeight.current
      
      requestAnimationFrame(() => {
        if (camera) {
          camera.position.copy(targetPos)
          
          // Look down at the ground
          const lookAtPoint = new THREE.Vector3(targetPos.x, terrainHeight, targetPos.z)
          camera.lookAt(lookAtPoint)
          
          // Initialize euler angles from camera rotation
          euler.current.setFromQuaternion(camera.quaternion)
          
          // Constrain pitch to look down
          euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x))
          camera.quaternion.setFromEuler(euler.current)
          
          camera.updateProjectionMatrix()
          setIsInitialized(true)
        }
      })
    }
  }, [camera, waypoints, isInitialized, getTerrainHeight])

  // Pointer lock for mouse look
  useEffect(() => {
    if (!isInitialized || !isFreeFlight || isTouring) return

    const canvas = gl.domElement
    
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas
    }

    const handleClick = () => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock()
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked.current) return

      const movementX = event.movementX || 0
      const movementY = event.movementY || 0

      // Update euler angles
      euler.current.setFromQuaternion(camera.quaternion)
      
      // Horizontal rotation (yaw)
      euler.current.y -= movementX * sensitivity
      
      // Vertical rotation (pitch) - constrained to look down
      euler.current.x -= movementY * sensitivity
      euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x))

      // Apply rotation
      camera.quaternion.setFromEuler(euler.current)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('pointerlockerror', () => {
      console.warn('Pointer lock failed')
    })
    canvas.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock()
      }
    }
  }, [camera, gl, isInitialized, isFreeFlight, isTouring])

  // Keyboard controls for WASD movement
  useEffect(() => {
    if (!isInitialized) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Space bar to toggle between free flight and guided tour
      if (event.code === 'Space') {
        event.preventDefault()
        setIsFreeFlight(!isFreeFlight)
        setIsTouring(false)
        return
      }

      // Arrow keys for guided tour navigation (when not in free flight)
      if (!isFreeFlight && enableGuidedTour) {
        if (event.key === 'ArrowRight' || event.key === 'n' || event.key === 'N') {
          event.preventDefault()
          goToNextWaypoint()
          return
        } else if (event.key === 'ArrowLeft' || event.key === 'p' || event.key === 'P') {
          event.preventDefault()
          goToPreviousWaypoint()
          return
        }
      }

      // WASD keys for free flight movement (horizontal movement)
      // I and K keys for vertical movement (altitude)
      if (isFreeFlight && !isTouring) {
        switch (event.key.toLowerCase()) {
          case 'w':
            keysRef.current.forward = true
            event.preventDefault()
            break
          case 's':
            keysRef.current.backward = true
            event.preventDefault()
            break
          case 'a':
            keysRef.current.left = true
            event.preventDefault()
            break
          case 'd':
            keysRef.current.right = true
            event.preventDefault()
            break
          case 'i':
            keysRef.current.up = true
            event.preventDefault()
            break
          case 'k':
            keysRef.current.down = true
            event.preventDefault()
            break
        }
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          keysRef.current.forward = false
          break
        case 's':
          keysRef.current.backward = false
          break
        case 'a':
          keysRef.current.left = false
          break
        case 'd':
          keysRef.current.right = false
          break
        case 'i':
          keysRef.current.up = false
          break
        case 'k':
          keysRef.current.down = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isFreeFlight, enableGuidedTour, isTouring, isInitialized])

  // Handle camera movement and height locking in useFrame
  useFrame((state, delta) => {
    if (!isInitialized || !isFreeFlight || isTouring || !camera) return

    const keys = keysRef.current
    const speed = moveSpeed * delta * 60 // Frame-rate independent horizontal movement
    const vSpeed = verticalSpeed * delta * 60 // Frame-rate independent vertical movement

    // Handle horizontal movement
    if (keys.forward || keys.backward || keys.left || keys.right) {
      const direction = new THREE.Vector3()
      const right = new THREE.Vector3()
      
      // Get camera forward direction (projected onto XZ plane - no vertical component)
      camera.getWorldDirection(direction)
      direction.y = 0 // Remove vertical component
      direction.normalize()
      
      // Get right vector (also projected onto XZ plane)
      right.setFromMatrixColumn(camera.matrix, 0)
      right.y = 0 // Remove vertical component
      right.normalize()

      // Apply movement (only horizontal)
      if (keys.forward) {
        camera.position.addScaledVector(direction, speed)
      }
      if (keys.backward) {
        camera.position.addScaledVector(direction, -speed)
      }
      if (keys.left) {
        camera.position.addScaledVector(right, -speed)
      }
      if (keys.right) {
        camera.position.addScaledVector(right, speed)
      }
    }

    // Handle vertical movement (altitude)
    if (keys.up) {
      currentHoverHeight.current += vSpeed
    }
    if (keys.down) {
      currentHoverHeight.current -= vSpeed
    }

    // Clamp hover height between min and max
    currentHoverHeight.current = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, currentHoverHeight.current))

    // Lock camera height to hover height above terrain
    const terrainHeight = getTerrainHeight(camera.position.x, camera.position.z)
    camera.position.y = terrainHeight + currentHoverHeight.current
    
    // Constrain pitch to always look down
    euler.current.setFromQuaternion(camera.quaternion)
    euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x))
    camera.quaternion.setFromEuler(euler.current)
  })

  // Animate camera to waypoint
  const animateToWaypoint = useCallback((waypoint: CameraWaypoint, duration: number = 2) => {
    setIsTouring(true)
    
    const targetPosition = new THREE.Vector3(...waypoint.position)
    const terrainHeight = getTerrainHeight(targetPosition.x, targetPosition.z)
    currentHoverHeight.current = DEFAULT_HOVER_HEIGHT
    targetPosition.y = terrainHeight + currentHoverHeight.current
    
    const targetLookAt = new THREE.Vector3(targetPosition.x, terrainHeight, targetPosition.z)

    // Animate camera position
    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Update height to stay at hover height above terrain
        const currentTerrainHeight = getTerrainHeight(camera.position.x, camera.position.z)
        camera.position.y = currentTerrainHeight + currentHoverHeight.current
        
        // Update lookAt during animation
        camera.lookAt(new THREE.Vector3(camera.position.x, currentTerrainHeight, camera.position.z))
        euler.current.setFromQuaternion(camera.quaternion)
        euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
      },
      onComplete: () => {
        camera.lookAt(targetLookAt)
        euler.current.setFromQuaternion(camera.quaternion)
        euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
        setIsTouring(false)
        onWaypointReached?.(waypoint, currentWaypointIndex)
      }
    })
  }, [camera, currentWaypointIndex, onWaypointReached, getTerrainHeight])

  const goToNextWaypoint = useCallback(() => {
    if (currentWaypointIndex < waypoints.length - 1) {
      const nextIndex = currentWaypointIndex + 1
      setCurrentWaypointIndex(nextIndex)
      animateToWaypoint(waypoints[nextIndex])
    }
  }, [currentWaypointIndex, waypoints, animateToWaypoint])

  const goToPreviousWaypoint = useCallback(() => {
    if (currentWaypointIndex > 0) {
      const prevIndex = currentWaypointIndex - 1
      setCurrentWaypointIndex(prevIndex)
      animateToWaypoint(waypoints[prevIndex])
    }
  }, [currentWaypointIndex, waypoints, animateToWaypoint])

  // Expose navigation functions globally for UI buttons
  useEffect(() => {
    ;(window as any).navigateToNextWaypoint = goToNextWaypoint
    ;(window as any).navigateToPreviousWaypoint = goToPreviousWaypoint
    ;(window as any).toggleFreeFlight = () => setIsFreeFlight(!isFreeFlight)
    
    return () => {
      delete (window as any).navigateToNextWaypoint
      delete (window as any).navigateToPreviousWaypoint
      delete (window as any).toggleFreeFlight
    }
  }, [goToNextWaypoint, goToPreviousWaypoint, isFreeFlight])

  // Expose camera position for minimap (update on every frame)
  useFrame(() => {
    if (camera && isInitialized) {
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const angle = Math.atan2(direction.x, -direction.z) * (180 / Math.PI)
      
      ;(window as any).__cameraState = {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
        angle,
        direction: {
          x: direction.x,
          y: direction.y,
          z: direction.z
        }
      }
    }
  })

  // No OrbitControls - using custom FPS-style controls
  return null
}
