'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { latLngToWorld } from '@/lib/terrain/coordinates'

export type SceneType = 
  | 'initial'
  | 'satellite-view'
  | 'satellite-orbit'
  | 'ground-level'

interface SceneSequenceControllerProps {
  /**
   * Current active scene
   */
  currentScene?: SceneType
  /**
   * Whether to auto-advance scenes
   */
  autoAdvance?: boolean
  /**
   * Duration to stay in each scene before auto-advancing (seconds)
   */
  sceneDuration?: number
  /**
   * Callback when scene changes
   */
  onSceneChange?: (scene: SceneType) => void
}

/**
 * Controller for sequencing different camera scenes/views
 * Manages transitions between: initial -> satellite-view -> satellite-orbit -> ground-level
 */
export default function SceneSequenceController({
  currentScene = 'initial',
  autoAdvance = false,
  sceneDuration = 10,
  onSceneChange
}: SceneSequenceControllerProps) {
  const { camera } = useThree()
  const currentSceneRef = useRef<SceneType>(currentScene)
  const isTransitioningRef = useRef(false)
  const sceneStartTimeRef = useRef(Date.now())
  const animationRef = useRef<gsap.core.Tween | null>(null)

  // Light beam base coordinates (target for satellite orbit)
  const LIGHT_BEAM_LAT = -52.937139
  const LIGHT_BEAM_LNG = -70.849639

  // Get terrain height at a position
  const getTerrainHeight = (x: number, z: number): number => {
    const terrainMesh = (window as any).__terrainMesh as THREE.Mesh | undefined
    if (!terrainMesh) return 0

    const raycaster = new THREE.Raycaster()
    raycaster.set(
      new THREE.Vector3(x, 1000, z),
      new THREE.Vector3(0, -1, 0)
    )
    const intersects = raycaster.intersectObject(terrainMesh, false)
    return intersects.length > 0 ? intersects[0].point.y : 0
  }

  // Transition to satellite view (high altitude, looking down)
  const transitionToSatelliteView = useCallback(() => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true

    const [targetX, , targetZ] = latLngToWorld(LIGHT_BEAM_LAT, LIGHT_BEAM_LNG)
    const terrainHeight = getTerrainHeight(targetX, targetZ)
    const targetY = terrainHeight + 40000 // 40km altitude

    const targetPosition = new THREE.Vector3(targetX, targetY, targetZ)
    const targetLookAt = new THREE.Vector3(targetX, terrainHeight, targetZ)

    if (animationRef.current) {
      animationRef.current.kill()
    }

    animationRef.current = gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 4,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(targetLookAt)
      },
      onComplete: () => {
        camera.lookAt(targetLookAt)
        isTransitioningRef.current = false
        currentSceneRef.current = 'satellite-view'
        sceneStartTimeRef.current = Date.now()
        onSceneChange?.('satellite-view')
      }
    })
  }, [camera, onSceneChange])

  // Transition to satellite orbit (camera orbits around light beam base)
  const transitionToSatelliteOrbit = useCallback(() => {
    if (isTransitioningRef.current) return
    isTransitioningRef.current = true

    const [targetX, , targetZ] = latLngToWorld(LIGHT_BEAM_LAT, LIGHT_BEAM_LNG)
    const terrainHeight = getTerrainHeight(targetX, targetZ)
    
    // Start orbit from current position, moving to orbital path
    const orbitalRadius = 20000 // 20km radius
    const altitude = 50000 // 50km altitude
    const startAngle = Math.atan2(
      camera.position.z - targetZ,
      camera.position.x - targetX
    )

    // Animate to orbital position
    const targetX_orbital = targetX + Math.cos(startAngle) * orbitalRadius
    const targetZ_orbital = targetZ + Math.sin(startAngle) * orbitalRadius
    const targetY_orbital = terrainHeight + altitude

    const targetPosition = new THREE.Vector3(targetX_orbital, targetY_orbital, targetZ_orbital)
    const targetLookAt = new THREE.Vector3(targetX, terrainHeight, targetZ)

    if (animationRef.current) {
      animationRef.current.kill()
    }

    animationRef.current = gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 5,
      ease: 'power2.inOut',
      onUpdate: () => {
        // During transition, look at target
        const currentLookAt = new THREE.Vector3(
          targetX,
          terrainHeight,
          targetZ
        )
        camera.lookAt(currentLookAt)
      },
      onComplete: () => {
        camera.lookAt(targetLookAt)
        isTransitioningRef.current = false
        currentSceneRef.current = 'satellite-orbit'
        sceneStartTimeRef.current = Date.now()
        onSceneChange?.('satellite-orbit')
        
        // Enable satellite orbit camera
        if (typeof window !== 'undefined') {
          ;(window as any).__enableSatelliteOrbit = true
        }
      }
    })
  }, [camera, onSceneChange])

  // Update current scene
  useEffect(() => {
    currentSceneRef.current = currentScene
    sceneStartTimeRef.current = Date.now()
    
    // Trigger appropriate transition based on scene
    if (currentScene === 'satellite-view') {
      transitionToSatelliteView()
    } else if (currentScene === 'satellite-orbit') {
      transitionToSatelliteOrbit()
    } else if (currentScene === 'initial') {
      // Reset to initial position
      if (typeof window !== 'undefined') {
        ;(window as any).__enableSatelliteOrbit = false
      }
    }
  }, [currentScene, transitionToSatelliteView, transitionToSatelliteOrbit])

  // Auto-advance scenes
  useEffect(() => {
    if (!autoAdvance) return

    const checkAutoAdvance = () => {
      const elapsed = (Date.now() - sceneStartTimeRef.current) / 1000
      
      if (elapsed >= sceneDuration && !isTransitioningRef.current) {
        const current = currentSceneRef.current
        
        if (current === 'satellite-view') {
          // Auto-advance to satellite orbit after satellite view
          onSceneChange?.('satellite-orbit')
        }
      }
    }

    const interval = setInterval(checkAutoAdvance, 1000)
    return () => clearInterval(interval)
  }, [autoAdvance, sceneDuration, onSceneChange])

  // Expose scene control functions globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__goToSatelliteView = () => {
        onSceneChange?.('satellite-view')
      }
      ;(window as any).__goToSatelliteOrbit = () => {
        onSceneChange?.('satellite-orbit')
      }
      ;(window as any).__getCurrentScene = () => {
        return currentSceneRef.current
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__goToSatelliteView
        delete (window as any).__goToSatelliteOrbit
        delete (window as any).__getCurrentScene
      }
    }
  }, [onSceneChange])

  return null
}

