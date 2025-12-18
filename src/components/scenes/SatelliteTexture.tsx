'use client'

import { useRef, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CORRIDOR_BOUNDS, TERRAIN_SIZE } from '@/lib/terrain/coordinates'

interface SatelliteTextureProps {
  terrainMesh: THREE.Mesh | null
}

/**
 * Component that applies satellite imagery texture to terrain
 * Uses OpenStreetMap or similar tile service to get real imagery
 */
export default function SatelliteTexture({ terrainMesh }: SatelliteTextureProps) {
  const { scene } = useThree()
  const [satelliteTexture, setSatelliteTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!terrainMesh) return

    // Calculate tile bounds for the corridor
    const centerLat = (CORRIDOR_BOUNDS.minLat + CORRIDOR_BOUNDS.maxLat) / 2
    const centerLng = (CORRIDOR_BOUNDS.minLng + CORRIDOR_BOUNDS.maxLng) / 2
    
    // Use a zoom level appropriate for the terrain size (50km)
    // Zoom level 10-11 is good for this scale
    const zoom = 11
    
    // Create a canvas to composite satellite tiles
    const canvas = document.createElement('canvas')
    const tileSize = 256
    // Calculate how many tiles we need
    const tilesPerSide = Math.pow(2, zoom)
    canvas.width = tileSize * 4 // Use 4x4 tiles for coverage
    canvas.height = tileSize * 4
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Function to get tile coordinates from lat/lng
    const deg2num = (lat: number, lng: number, zoom: number) => {
      const n = Math.pow(2, zoom)
      const lat_rad = lat * Math.PI / 180
      const xtile = Math.floor((lng + 180) / 360 * n)
      const ytile = Math.floor((1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2 * n)
      return { x: xtile, y: ytile }
    }

    const centerTile = deg2num(centerLat, centerLng, zoom)
    
    // Load tiles from OpenStreetMap (or use a satellite tile service)
    // For now, we'll create a placeholder that can be replaced with actual tile loading
    const loadTiles = async () => {
      try {
        // Try to load a single high-res satellite image covering the area
        // Using a tile service URL pattern (this is a placeholder - you may need API key)
        const tileUrl = `https://tile.openstreetmap.org/${zoom}/${centerTile.x}/${centerTile.y}.png`
        
        // For now, create a procedural texture that represents the area
        // In production, you'd load actual satellite tiles
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        // Create a greyscale texture representing the terrain
        // This is a placeholder - replace with actual satellite tile loading
        const imageData = ctx.createImageData(canvas.width, canvas.height)
        const data = imageData.data
        
        // Create a simple pattern representing land/water
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4
            // Create a pattern (this should be replaced with actual satellite imagery)
            const pattern = (x + y) % 100 < 50 ? 0.3 : 0.5 // Simple pattern
            data[i] = pattern * 255     // R
            data[i + 1] = pattern * 255 // G
            data[i + 2] = pattern * 255 // B
            data[i + 3] = 255            // A
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        
        setSatelliteTexture(texture)
        
        // Apply texture to terrain material if it's a MeshStandardMaterial
        if (terrainMesh.material instanceof THREE.MeshStandardMaterial) {
          terrainMesh.material.map = texture
          terrainMesh.material.needsUpdate = true
        } else if (terrainMesh.material instanceof THREE.ShaderMaterial) {
          // For shader materials, we'd need to add a uniform
          console.log('[SatelliteTexture] Shader material detected - texture application may need custom implementation')
        }
      } catch (error) {
        console.warn('[SatelliteTexture] Failed to load satellite tiles:', error)
      }
    }

    loadTiles()

    return () => {
      if (satelliteTexture) {
        satelliteTexture.dispose()
      }
    }
  }, [terrainMesh, scene])

  return null
}

