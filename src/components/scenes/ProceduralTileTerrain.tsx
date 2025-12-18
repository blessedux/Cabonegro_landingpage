'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE, TERRAIN_CENTER } from '@/lib/terrain/coordinates'
import { latLngToTile } from '@/lib/terrain/map-tiles'

// Convert tile coordinates to lat/lng
function tileToLatLng(x: number, y: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom)
  const lng = (x / n) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)))
  const lat = latRad * 180 / Math.PI
  return [lat, lng]
}

interface TileMesh {
  x: number
  y: number
  zoom: number
  mesh: THREE.Mesh | null
  texture: THREE.Texture | null
  loading: boolean
  loaded: boolean
}

/**
 * ProceduralTileTerrain - Loads tiles on-demand based on camera position
 * Only loads tiles that are visible, loads more as camera moves
 */
export default function ProceduralTileTerrain({
  zoom = 13,
  tileSize = 256,
  loadDistance = 5, // Load tiles within N tiles of camera
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  heightScale = 1500
}: {
  zoom?: number
  tileSize?: number
  loadDistance?: number
  heightmapUrl?: string
  heightScale?: number
}) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const [tiles, setTiles] = useState<Map<string, TileMesh>>(new Map())
  const [heightmapTexture, setHeightmapTexture] = useState<THREE.Texture | null>(null)
  const loadingTiles = useRef<Set<string>>(new Set())

  // Load heightmap
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      heightmapUrl,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        setHeightmapTexture(texture)
        console.log('[ProceduralTileTerrain] Heightmap loaded')
      },
      undefined,
      (error) => {
        console.error('[ProceduralTileTerrain] Failed to load heightmap:', error)
      }
    )
  }, [heightmapUrl])

  // Calculate which tiles are visible based on camera position
  const getVisibleTiles = () => {
    if (!camera) return []

    const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
    const cameraPos = camera.position
    
    // Calculate tile coordinates from camera position
    // Camera position is in world space (meters), convert to tile space
    const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
    
    // Convert camera world position to tile coordinates
    // World origin (0,0,0) corresponds to TERRAIN_CENTER
    const tileX = Math.floor(centerTile.x + (cameraPos.x / metersPerTile))
    const tileY = Math.floor(centerTile.y + (cameraPos.z / metersPerTile))
    
    const visibleTiles: Array<{ x: number; y: number }> = []
    
    // Load tiles in a grid around camera (loadDistance tiles in each direction)
    // This creates a (2*loadDistance + 1) x (2*loadDistance + 1) grid
    // For loadDistance=5, this is an 11x11 grid (121 tiles total)
    for (let dx = -loadDistance; dx <= loadDistance; dx++) {
      for (let dy = -loadDistance; dy <= loadDistance; dy++) {
        visibleTiles.push({
          x: tileX + dx,
          y: tileY + dy
        })
      }
    }
    
    return visibleTiles
  }

  // Load a single tile
  const loadTile = async (x: number, y: number): Promise<void> => {
    const tileKey = `${zoom}_${x}_${y}`
    
    // Skip if already loading or loaded
    if (loadingTiles.current.has(tileKey) || tiles.has(tileKey)) {
      return
    }

    loadingTiles.current.add(tileKey)
    console.log(`[ProceduralTileTerrain] Starting load for tile ${tileKey}`)

    // Create placeholder tile
    setTiles(prev => {
      const newTiles = new Map(prev)
      newTiles.set(tileKey, {
        x,
        y,
        zoom,
        mesh: null,
        texture: null,
        loading: true,
        loaded: false
      })
      return newTiles
    })

    try {
      // Load tile image - each tile is a 256x256 PNG showing only that tile's portion
      const tilePath = `/assets/tiles/${zoom}_${x}_${y}.png`
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        const loader = new THREE.TextureLoader()
        loader.load(
          tilePath,
          (tex) => {
            // Each tile texture should NOT repeat - it's already the correct portion
            tex.wrapS = THREE.ClampToEdgeWrapping
            tex.wrapT = THREE.ClampToEdgeWrapping
            tex.colorSpace = THREE.SRGBColorSpace
            tex.flipY = false // Tiles are typically not flipped
            resolve(tex)
          },
          undefined,
          (error) => {
            console.warn(`[ProceduralTileTerrain] Failed to load tile ${tileKey}:`, error)
            reject(error)
          }
        )
      })

      // Calculate world position for this tile
      const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
      const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
      
      // Calculate tile's world position
      // Tile (x, y) relative to center tile
      const tileOffsetX = x - centerTile.x
      const tileOffsetY = y - centerTile.y
      
      // World position: center tile is at (0, 0, 0)
      const worldX = tileOffsetX * metersPerTile
      const worldZ = tileOffsetY * metersPerTile

      // Create plane geometry for this tile
      // Each tile is exactly metersPerTile x metersPerTile in world space
      const geometry = new THREE.PlaneGeometry(metersPerTile, metersPerTile, 32, 32)
      geometry.rotateX(-Math.PI / 2) // Rotate to lay flat on XZ plane
      
      // IMPORTANT: UV coordinates should be 0-1 for each tile (not repeating)
      // The texture is already the correct tile portion, so UVs should map 0-1
      const uvs = geometry.attributes.uv
      for (let i = 0; i < uvs.count; i++) {
        // Keep UVs at 0-1 range - each tile shows its own texture portion
        uvs.setX(i, uvs.getX(i)) // Already 0-1, no change needed
        uvs.setY(i, uvs.getY(i)) // Already 0-1, no change needed
      }
      uvs.needsUpdate = true
      
      // Position the geometry at the correct world position
      // The geometry center is at (0, 0, 0) after creation, so we translate it
      geometry.translate(worldX, 0, worldZ)

      // Apply heightmap displacement to this tile
      // Each tile needs to sample the heightmap at its specific world position
      if (heightmapTexture && heightmapTexture.image) {
        const positions = geometry.attributes.position
        const uvs = geometry.attributes.uv
        
        // Create a temporary canvas to sample the heightmap
        const canvas = document.createElement('canvas')
        canvas.width = heightmapTexture.image.width || 1024
        canvas.height = heightmapTexture.image.height || 1024
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          ctx.drawImage(heightmapTexture.image, 0, 0)
          
          // Calculate this tile's position in the overall heightmap
          // We need to map world position to heightmap UV coordinates
          const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
          const totalTilesX = Math.pow(2, zoom)
          const totalTilesY = Math.pow(2, zoom)
          
          // Calculate tile's position in the full map (0-1 range)
          const tileU = x / totalTilesX
          const tileV = y / totalTilesY
          
          for (let i = 0; i < positions.count; i++) {
            // Get local UV within this tile (0-1)
            const localU = uvs.getX(i)
            const localV = uvs.getY(i)
            
            // Convert to global heightmap coordinates
            // Each tile covers 1/totalTilesX of the map width
            const tileWidthInMap = 1 / totalTilesX
            const tileHeightInMap = 1 / totalTilesY
            
            // Global UV coordinates in the heightmap
            const globalU = tileU + (localU * tileWidthInMap)
            const globalV = tileV + (localV * tileHeightInMap)
            
            // Sample heightmap at global coordinates
            const imageData = ctx.getImageData(
              Math.floor(globalU * canvas.width),
              Math.floor((1 - globalV) * canvas.height), // Flip V coordinate
              1,
              1
            )
            
            // Use red channel for height (grayscale image)
            const height = (imageData.data[0] / 255) * heightScale
            positions.setY(i, height)
          }
          
          positions.needsUpdate = true
          geometry.computeVertexNormals()
        }
      }

      // Create material
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1.0,
        metalness: 0.0,
      })

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material)
      mesh.receiveShadow = true
      mesh.castShadow = false

      // Update tile state
      setTiles(prev => {
        const newTiles = new Map(prev)
        const tile = newTiles.get(tileKey)
        if (tile) {
          newTiles.set(tileKey, {
            ...tile,
            mesh,
            texture,
            loading: false,
            loaded: true
          })
        }
        return newTiles
      })

      // Set global terrain mesh reference (use first loaded tile)
      if (typeof window !== 'undefined' && !(window as any).__terrainMesh) {
        ;(window as any).__terrainMesh = mesh
      }

      console.log(`[ProceduralTileTerrain] ✓ Loaded and ready to render tile ${tileKey} at world position (${worldX.toFixed(1)}, 0, ${worldZ.toFixed(1)})`)
      
      // Force immediate render by adding mesh to group right away
      if (groupRef.current && !groupRef.current.children.some(child => child.userData.tileKey === tileKey)) {
        mesh.userData.tileKey = tileKey
        groupRef.current.add(mesh)
        console.log(`[ProceduralTileTerrain] ✓ Added tile ${tileKey} to scene immediately`)
      }
    } catch (error) {
      console.error(`[ProceduralTileTerrain] Error loading tile ${tileKey}:`, error)
      
      // Remove failed tile
      setTiles(prev => {
        const newTiles = new Map(prev)
        newTiles.delete(tileKey)
        return newTiles
      })
    } finally {
      loadingTiles.current.delete(tileKey)
    }
  }

  // Update visible tiles based on camera position
  useFrame(() => {
    if (!camera || !groupRef.current) return

    const visibleTiles = getVisibleTiles()

    // Load ALL new tiles that are visible but not yet loaded - in parallel
    const tilesToLoad: Array<{ x: number; y: number }> = []
    visibleTiles.forEach(({ x, y }) => {
      const tileKey = `${zoom}_${x}_${y}`
      if (!tiles.has(tileKey) && !loadingTiles.current.has(tileKey)) {
        tilesToLoad.push({ x, y })
      }
    })

    // Load all tiles in parallel immediately
    if (tilesToLoad.length > 0) {
      const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
      const cameraPos = camera.position
      const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
      const tileX = Math.floor(centerTile.x + (cameraPos.x / metersPerTile))
      const tileY = Math.floor(centerTile.y + (cameraPos.z / metersPerTile))
      
      console.log(`[ProceduralTileTerrain] Camera at (${cameraPos.x.toFixed(0)}, ${cameraPos.y.toFixed(0)}, ${cameraPos.z.toFixed(0)}), center tile (${tileX}, ${tileY})`)
      console.log(`[ProceduralTileTerrain] Loading ${tilesToLoad.length} tiles in parallel (${visibleTiles.length} total visible, ${Array.from(tiles.keys()).filter(k => tiles.get(k)?.loaded).length} already loaded)`)
      
      // Start loading all tiles simultaneously
      tilesToLoad.forEach(({ x, y }) => {
        loadTile(x, y)
      })
    }

    // Remove tiles that are too far away (not in visible set)
    const visibleTileKeys = new Set(visibleTiles.map(t => `${zoom}_${t.x}_${t.y}`))
    const currentTiles = Array.from(tiles.keys())
    
    currentTiles.forEach(tileKey => {
      if (!visibleTileKeys.has(tileKey)) {
        const tile = tiles.get(tileKey)
        if (tile) {
          // Dispose resources
          if (tile.mesh) {
            tile.mesh.geometry.dispose()
            if (tile.mesh.material instanceof THREE.Material) {
              tile.mesh.material.dispose()
            }
            if (tile.texture) {
              tile.texture.dispose()
            }
          }
          
          setTiles(prev => {
            const newTiles = new Map(prev)
            newTiles.delete(tileKey)
            return newTiles
          })
        }
      }
    })

    // Update group children - ensure ALL loaded meshes are in the scene
    if (groupRef.current) {
      // Get current mesh keys that are already in the scene
      const currentMeshKeys = new Set(
        Array.from(groupRef.current.children)
          .filter(child => child.userData.tileKey)
          .map(child => child.userData.tileKey as string)
      )
      
      // Get all loaded tiles that should be in the scene
      const tilesToKeep = new Set(Array.from(tiles.keys()).filter(key => {
        const tile = tiles.get(key)
        return tile && tile.loaded && tile.mesh !== null
      }))
      
      // Remove meshes that are no longer needed (not in visible tiles or not loaded)
      const visibleTileKeys = new Set(visibleTiles.map(t => `${zoom}_${t.x}_${t.y}`))
      const childrenToRemove: THREE.Object3D[] = []
      groupRef.current.children.forEach(child => {
        const tileKey = child.userData.tileKey as string
        if (tileKey && (!visibleTileKeys.has(tileKey) || !tilesToKeep.has(tileKey))) {
          childrenToRemove.push(child)
        }
      })
      childrenToRemove.forEach(child => {
        groupRef.current!.remove(child)
        console.log(`[ProceduralTileTerrain] Removed tile ${child.userData.tileKey} from scene`)
      })
      
      // Add ALL loaded meshes that aren't already in the scene
      let addedCount = 0
      tiles.forEach((tile, tileKey) => {
        if (tile.mesh && tile.loaded && !currentMeshKeys.has(tileKey)) {
          tile.mesh.userData.tileKey = tileKey
          groupRef.current!.add(tile.mesh)
          addedCount++
        }
      })
      
      if (addedCount > 0) {
        console.log(`[ProceduralTileTerrain] Added ${addedCount} new tiles to scene. Total tiles in scene: ${groupRef.current.children.length}`)
      }
    }
  })

  return <group ref={groupRef} />
}
