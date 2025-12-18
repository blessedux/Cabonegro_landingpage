/**
 * Local tile loader - loads tiles from public/assets/tiles directory
 * Falls back to online tiles if local tiles don't exist
 */

import { TERRAIN_CENTER } from './coordinates'

/**
 * Convert lat/lng to tile coordinates
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  )
  return { x, y }
}

/**
 * Get local tile path
 */
export function getLocalTilePath(x: number, y: number, zoom: number): string {
  return `/assets/tiles/${zoom}_${x}_${y}.png`
}

/**
 * Check if local tile exists
 */
export async function hasLocalTile(x: number, y: number, zoom: number): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    const path = getLocalTilePath(x, y, zoom)
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Load tile image (local first, then fallback to online)
 */
export async function loadTileImage(
  x: number,
  y: number,
  zoom: number,
  onlineUrl: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    // Try local tile first
    const localPath = getLocalTilePath(x, y, zoom)
    
    img.onload = () => {
      if (img.width > 0 && img.height > 0) {
        resolve(img)
      } else {
        // Invalid image, try online
        tryOnline()
      }
    }
    
    img.onerror = () => {
      // Local tile failed, try online
      tryOnline()
    }
    
    const tryOnline = () => {
      const onlineImg = new Image()
      onlineImg.crossOrigin = 'anonymous'
      
      onlineImg.onload = () => {
        if (onlineImg.width > 0 && onlineImg.height > 0) {
          resolve(onlineImg)
        } else {
          reject(new Error(`Failed to load tile ${x}/${y}`))
        }
      }
      
      onlineImg.onerror = () => {
        reject(new Error(`Failed to load tile ${x}/${y} from both local and online`))
      }
      
      onlineImg.src = onlineUrl
    }
    
    // Try local first
    img.src = localPath
  })
}

/**
 * Calculate required tiles for terrain area
 */
export function getRequiredTiles(zoom: number = 13): {
  tiles: Array<{ x: number; y: number }>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
} {
  const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
  
  const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
  const radiusInTiles = Math.ceil(40000 / metersPerTile) // 40km in tiles
  const maxTiles = 150
  const actualRadius = Math.min(radiusInTiles, maxTiles)
  
  const tiles: Array<{ x: number; y: number }> = []
  const minX = centerTile.x - actualRadius
  const maxX = centerTile.x + actualRadius
  const minY = centerTile.y - actualRadius
  const maxY = centerTile.y + actualRadius
  
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ x, y })
    }
  }
  
  return { tiles, bounds: { minX, maxX, minY, maxY } }
}


