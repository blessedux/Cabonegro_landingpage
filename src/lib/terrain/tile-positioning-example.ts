/**
 * Example: How to position a specific geographical location to a tile
 * 
 * This file demonstrates how to convert a lat/lng coordinate to tile coordinates
 * and world position for use in the ProceduralTileTerrain system.
 */

import { 
  getTileForLocation, 
  latLngToTileCoords, 
  tileCoordsToWorldPosition,
  dmsToDecimal,
  CABO_NEGRO_COORDS,
  TERRAIN_CENTER
} from './coordinates'

/**
 * Example: Convert 52°56'13.7"S 70°50'58.7"W to tile coordinates
 * 
 * This is the same location as CABO_NEGRO_COORDS
 */
export function exampleCaboNegroPositioning() {
  // Method 1: Using decimal degrees directly
  const lat = -52.937139  // 52°56'13.7"S
  const lng = -70.849639  // 70°50'58.7"W
  const zoom = 13  // Same zoom level as ProceduralTileTerrain
  
  // Get complete tile information
  const tileInfo = getTileForLocation(lat, lng, zoom)
  
  console.log('Tile Information for 52°56\'13.7"S 70°50\'58.7"W:')
  console.log('  Tile coordinates:', tileInfo.tile)
  console.log('  World position (x, y, z):', tileInfo.worldPosition)
  console.log('  Meters per tile:', tileInfo.metersPerTile.toFixed(2))
  console.log('  Tile key (for loading):', tileInfo.tileKey)
  
  return tileInfo
}

/**
 * Example: Convert DMS (degrees/minutes/seconds) to decimal and get tile
 */
export function exampleDmsToTile() {
  // Convert 52°56'13.7"S 70°50'58.7"W to decimal
  const lat = dmsToDecimal(52, 56, 13.7, true)  // true = South (negative)
  const lng = dmsToDecimal(70, 50, 58.7, true)  // true = West (negative)
  
  console.log('Converted DMS to decimal:')
  console.log('  Latitude:', lat)
  console.log('  Longitude:', lng)
  
  // Get tile information
  const tileInfo = getTileForLocation(lat, lng, 13)
  return tileInfo
}

/**
 * Example: Position a 3D object at a specific lat/lng
 * 
 * Use this in your React Three Fiber components to position objects
 */
export function examplePositionObject() {
  const lat = -52.937139
  const lng = -70.849639
  const zoom = 13
  
  // Get world position
  const tileInfo = getTileForLocation(lat, lng, zoom)
  const [x, y, z] = tileInfo.worldPosition
  
  // In your React Three Fiber component:
  // <mesh position={[x, y, z]}>
  //   <boxGeometry args={[10, 10, 10]} />
  //   <meshStandardMaterial color="red" />
  // </mesh>
  
  return { x, y, z, tileInfo }
}

/**
 * Example: Check if a location is within the loaded tile range
 * 
 * This helps determine if a tile needs to be loaded
 */
export function exampleCheckTileInRange(
  lat: number,
  lng: number,
  centerTile: { x: number; y: number },
  loadDistance: number = 5
): boolean {
  const targetTile = latLngToTileCoords(lat, lng, 13)
  
  const dx = Math.abs(targetTile.x - centerTile.x)
  const dy = Math.abs(targetTile.y - centerTile.y)
  
  const isInRange = dx <= loadDistance && dy <= loadDistance
  
  console.log(`Tile (${targetTile.x}, ${targetTile.y}) is ${isInRange ? 'within' : 'outside'} range of center tile (${centerTile.x}, ${centerTile.y})`)
  
  return isInRange
}

/**
 * Quick reference: Common locations and their tile coordinates
 */
export const COMMON_LOCATIONS = {
  caboNegro: {
    name: 'Cabo Negro',
    lat: -52.937139,  // 52°56'13.7"S
    lng: -70.849639,  // 70°50'58.7"W
    tile: getTileForLocation(-52.937139, -70.849639, 13)
  },
  terrainCenter: {
    name: 'Terrain Center',
    lat: TERRAIN_CENTER.lat,
    lng: TERRAIN_CENTER.lng,
    tile: getTileForLocation(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, 13)
  }
}

// Example usage in console:
// Run this in browser console after importing:
// import { exampleCaboNegroPositioning } from '@/lib/terrain/tile-positioning-example'
// exampleCaboNegroPositioning()
