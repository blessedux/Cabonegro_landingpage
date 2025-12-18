'use client'

import { useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE, CORRIDOR_BOUNDS, latLngToWorld, worldToLatLng } from '@/lib/terrain/coordinates'

/**
 * Controller component that runs inside Canvas
 * Monitors camera position and updates shared state
 */
export function MinimapController() {
  const { camera } = useThree()
  const lastUpdateTime = useRef(0)
  const THROTTLE_MS = 50 // Update every 50ms for smooth minimap

  useFrame(() => {
    if (!camera || !camera.position) return
    
    const now = Date.now()
    if (now - lastUpdateTime.current < THROTTLE_MS) return
    lastUpdateTime.current = now

    // Get camera position (x, z coordinates on the terrain plane)
    const x = camera.position.x
    const z = camera.position.z
    
    // Get camera forward direction
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    
    // Calculate angle from forward direction (0 degrees = north/negative Z)
    const angle = Math.atan2(direction.x, -direction.z) * (180 / Math.PI)

    // Convert to lat/lng for minimap
    const [lat, lng] = worldToLatLng(x, z)

    // Update window state for UI component to read
    if (typeof window !== 'undefined') {
      ;(window as any).__minimapState = {
        position: { x, z },
        latLng: { lat, lng },
        angle,
        direction: {
          x: direction.x,
          y: direction.y,
          z: direction.z
        }
      }

      // Trigger custom event for UI component
      window.dispatchEvent(new CustomEvent('minimap-update', {
        detail: { position: { x, z }, latLng: { lat, lng }, angle }
      }))
    }
  })

  return null // This component doesn't render anything
}

/**
 * UI component that renders outside Canvas
 * Reads state from window object and renders fixed minimap overlay with coastline
 */
export default function Minimap() {
  const [cameraPos, setCameraPos] = useState({ x: 0, z: 0 })
  const [cameraLatLng, setCameraLatLng] = useState({ lat: 0, lng: 0 })
  const [cameraAngle, setCameraAngle] = useState(0)

  // Listen for updates from controller
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUpdate = (event: CustomEvent) => {
      const { position, latLng, angle } = event.detail
      setCameraPos(position)
      if (latLng) setCameraLatLng(latLng)
      setCameraAngle(angle)
    }

    window.addEventListener('minimap-update', handleUpdate as EventListener)
    
    // Initial check
    if ((window as any).__minimapState) {
      const state = (window as any).__minimapState
      setCameraPos(state.position)
      if (state.latLng) setCameraLatLng(state.latLng)
      setCameraAngle(state.angle)
    }

    return () => {
      window.removeEventListener('minimap-update', handleUpdate as EventListener)
    }
  }, [])

  // Calculate minimap coordinates based on lat/lng bounds
  const latRange = CORRIDOR_BOUNDS.maxLat - CORRIDOR_BOUNDS.minLat
  const lngRange = CORRIDOR_BOUNDS.maxLng - CORRIDOR_BOUNDS.minLng
  
  // Normalize camera position to 0-1 range within corridor bounds
  const normalizedLat = (cameraLatLng.lat - CORRIDOR_BOUNDS.minLat) / latRange
  const normalizedLng = (cameraLatLng.lng - CORRIDOR_BOUNDS.minLng) / lngRange
  
  // Clamp to 0-1 range
  const mapX = Math.max(0, Math.min(1, normalizedLng))
  const mapZ = Math.max(0, Math.min(1, 1 - normalizedLat)) // Invert Y for screen coordinates

  // Calculate coastline visualization (simplified - represents water areas)
  // In a real implementation, you'd load actual coastline data
  const coastlinePath = `
    M 0.1,0.3
    L 0.15,0.25
    L 0.2,0.3
    L 0.25,0.28
    L 0.3,0.32
    L 0.35,0.3
    L 0.4,0.35
    L 0.45,0.33
    L 0.5,0.38
    L 0.55,0.35
    L 0.6,0.4
    L 0.65,0.38
    L 0.7,0.42
    L 0.75,0.4
    L 0.8,0.45
    L 0.85,0.43
    L 0.9,0.48
    Z
  `

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: '200px',
        height: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        overflow: 'hidden',
        zIndex: 1000,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Minimap background - represents terrain area with coastline */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#2a2a2a', // Dark grey for land
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,0.05) 9px, rgba(255,255,255,0.05) 10px),
            repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(255,255,255,0.05) 9px, rgba(255,255,255,0.05) 10px)
          `,
        }}
      >
        {/* SVG overlay for coastline */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {/* Water areas (darker) */}
          <path
            d={coastlinePath}
            fill="rgba(20, 20, 40, 0.6)"
            stroke="rgba(100, 150, 200, 0.4)"
            strokeWidth="1"
          />
          {/* Coastline outline */}
          <path
            d={coastlinePath}
            fill="none"
            stroke="rgba(150, 200, 255, 0.6)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Camera position indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${mapX * 100}%`,
            top: `${mapZ * 100}%`,
            width: '8px',
            height: '8px',
            backgroundColor: '#00ff00',
            border: '2px solid #ffffff',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)',
          }}
        />
        
        {/* Camera direction indicator (arrow) */}
        <div
          style={{
            position: 'absolute',
            left: `${mapX * 100}%`,
            top: `${mapZ * 100}%`,
            width: '0',
            height: '0',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '20px solid rgba(255, 255, 0, 0.8)',
            transform: `translate(-50%, -50%) rotate(${cameraAngle}deg)`,
            transformOrigin: '50% 100%',
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 0, 0.6))',
          }}
        />
        
        {/* Center marker (terrain center) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      
      {/* Minimap label */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none',
        }}
      >
        MAP
      </div>
      
      {/* Coordinates display */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '8px',
          fontFamily: 'monospace',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          pointerEvents: 'none',
        }}
      >
        Lat: {cameraLatLng.lat.toFixed(4)}<br />
        Lng: {cameraLatLng.lng.toFixed(4)}
      </div>
    </div>
  )
}
