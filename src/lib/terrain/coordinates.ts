/**
 * Coordinate conversion utilities for Cabo Negro, Chile
 * Converts between lat/lng and 3D world coordinates
 */

export const CABO_NEGRO_COORDS = {
  lat: -52.937139,
  lng: -70.849639
} as const

/**
 * Convert latitude/longitude to 3D world coordinates
 * Updated for larger area (Cabo Negro to Punta Arenas corridor)
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param radius Radius of the terrain in meters (default: TERRAIN_SIZE / 2)
 * @returns 3D position [x, y, z]
 */
export function latLngToWorld(
  lat: number,
  lng: number,
  radius: number = TERRAIN_SIZE / 2
): [number, number, number] {
  // Use center of corridor as reference point
  const centerLat = (CORRIDOR_BOUNDS.minLat + CORRIDOR_BOUNDS.maxLat) / 2
  const centerLng = (CORRIDOR_BOUNDS.minLng + CORRIDOR_BOUNDS.maxLng) / 2

  // Convert to radians
  const latRad = (lat - centerLat) * (Math.PI / 180)
  const lngRad = (lng - centerLng) * (Math.PI / 180)

  // Approximate conversion (for small areas, we can use flat projection)
  // For Patagonia, we use a simple Mercator-like projection
  // Account for latitude scaling (meters per degree)
  const metersPerDegreeLat = 111320 // Approximate meters per degree latitude
  const metersPerDegreeLng = 111320 * Math.cos(centerLat * Math.PI / 180)

  const x = lngRad * metersPerDegreeLng
  const z = -latRad * metersPerDegreeLat // Negative because in 3D, increasing lat goes north (negative Z in typical setup)
  const y = 0 // Height will be determined by terrain displacement

  return [x, y, z]
}

/**
 * Convert 3D world coordinates back to lat/lng
 * Updated for larger area
 * @param x X coordinate in world space
 * @param z Z coordinate in world space
 * @returns [latitude, longitude]
 */
export function worldToLatLng(
  x: number,
  z: number
): [number, number] {
  const centerLat = (CORRIDOR_BOUNDS.minLat + CORRIDOR_BOUNDS.maxLat) / 2
  const centerLng = (CORRIDOR_BOUNDS.minLng + CORRIDOR_BOUNDS.maxLng) / 2

  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos(centerLat * Math.PI / 180)

  const latRad = -z / metersPerDegreeLat
  const lngRad = x / metersPerDegreeLng

  const lat = centerLat + (latRad * 180) / Math.PI
  const lng = centerLng + (lngRad * 180) / Math.PI

  return [lat, lng]
}

/**
 * Get the terrain size in meters
 * Updated to cover 40km radius area (80km total diameter)
 */
export const TERRAIN_SIZE = 80000 // 80km (40km radius)

/**
 * Center point: 53°03'40.4"S 70°52'42.2"W
 * Converted to decimal: -53.061222, -70.878388
 */
export const TERRAIN_CENTER = {
  lat: -53.061222,
  lng: -70.878388
} as const

/**
 * Bounding box for 40km radius around center point
 * At latitude -53°, approximate conversions:
 * - 1 degree latitude ≈ 111,320 meters
 * - 1 degree longitude ≈ 66,960 meters (at -53°)
 * - 40km = 0.359° latitude, 0.597° longitude
 */
export const CORRIDOR_BOUNDS = {
  minLat: TERRAIN_CENTER.lat - 0.18, // ~20km south
  maxLat: TERRAIN_CENTER.lat + 0.18, // ~20km north
  minLng: TERRAIN_CENTER.lng - 0.30, // ~20km west
  maxLng: TERRAIN_CENTER.lng + 0.30, // ~20km east
} as const

/**
 * Primary center point for the 3D terrain view
 * 53°03'40.4"S 70°52'42.2"W
 */
export const TERRAIN_CENTER_POINT = TERRAIN_CENTER

/**
 * Key locations along the corridor
 */
export const CORRIDOR_WAYPOINTS = {
  caboNegro: { lat: -52.937139, lng: -70.849639 },
  puntaArenas: { lat: -53.1638, lng: -70.9171 },
  // Add more waypoints as needed
} as const

/**
 * Camera waypoints for interactive navigation
 * Each waypoint defines a camera position and look-at target
 */
export interface CameraWaypoint {
  name: string
  description?: string
  position: { lat: number; lng: number; altitude: number } // Camera position
  lookAt: { lat: number; lng: number } // Point camera looks at
  duration?: number // Animation duration in seconds (default: 3)
}

/**
 * Predefined camera waypoints for key locations
 */
export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  {
    name: 'Overview',
    description: 'Terrain center overview',
    position: { lat: TERRAIN_CENTER.lat, lng: TERRAIN_CENTER.lng, altitude: 5000 },
    lookAt: { lat: TERRAIN_CENTER.lat, lng: TERRAIN_CENTER.lng },
    duration: 3
  },
  {
    name: 'Cabo Negro',
    description: 'Cabo Negro area',
    position: { lat: -52.937139, lng: -70.849639, altitude: 3000 },
    lookAt: { lat: -52.937139, lng: -70.849639 },
    duration: 3
  },
  {
    name: 'Shipyard',
    description: 'Shipyard construction site',
    position: { lat: -52.95, lng: -70.85, altitude: 1500 },
    lookAt: { lat: -52.95, lng: -70.85 },
    duration: 3
  },
  {
    name: 'Vessels',
    description: 'Ocean vessels',
    position: { lat: -52.94, lng: -70.84, altitude: 1200 },
    lookAt: { lat: -52.94, lng: -70.84 },
    duration: 3
  },
  {
    name: 'Wind Farm',
    description: 'Wind turbine farm',
    position: { lat: -53.05, lng: -70.90, altitude: 2000 },
    lookAt: { lat: -53.05, lng: -70.90 },
    duration: 3
  },
  {
    name: 'Data Center',
    description: 'Data center storage complex',
    position: { lat: -53.08, lng: -70.88, altitude: 1800 },
    lookAt: { lat: -53.08, lng: -70.88 },
    duration: 3
  },
  {
    name: 'Coastline',
    description: 'Coastline view',
    position: { lat: -53.0, lng: -70.85, altitude: 2000 },
    lookAt: { lat: -53.05, lng: -70.88 },
    duration: 3
  }
]

/**
 * Industrial facility locations
 * These will be used for placing 3D models
 */
export interface IndustrialLocation {
  type: 'shipyard' | 'vessel' | 'windTurbine' | 'dataCenter'
  lat: number
  lng: number
  name?: string
  count?: number // For instanced models (e.g., wind turbines)
  scale?: number
  rotation?: number
}

/**
 * Industrial facility locations for 3D models
 * Coordinates are approximate - adjust based on actual satellite imagery
 */
export const INDUSTRIAL_LOCATIONS: IndustrialLocation[] = [
  // Shipyard (construction site) - near coastline
  {
    type: 'shipyard',
    lat: -52.95,
    lng: -70.85,
    name: 'Shipyard Construction',
    scale: 1.0,
    rotation: 0
  },
  // Vessels - multiple ships along coastline
  {
    type: 'vessel',
    lat: -52.94,
    lng: -70.84,
    name: 'Vessel 1',
    scale: 1.0,
    rotation: 45
  },
  {
    type: 'vessel',
    lat: -52.96,
    lng: -70.86,
    name: 'Vessel 2',
    scale: 1.0,
    rotation: -30
  },
  // Wind turbines - wind farm area
  {
    type: 'windTurbine',
    lat: -53.05,
    lng: -70.90,
    name: 'Wind Farm',
    count: 8, // 8 turbines in a grid
    scale: 1.0,
    rotation: 0
  },
  // Data center storage houses - inland area
  {
    type: 'dataCenter',
    lat: -53.08,
    lng: -70.88,
    name: 'Data Center Complex',
    count: 4, // 4 storage buildings
    scale: 1.0,
    rotation: 0
  }
]

/**
 * Convert latitude/longitude to tile coordinates (Web Mercator)
 * This is used for the ProceduralTileTerrain system
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param zoom Zoom level (default: 13, same as ProceduralTileTerrain)
 * @returns Tile coordinates { x, y }
 */
export function latLngToTileCoords(
  lat: number,
  lng: number,
  zoom: number = 13
): { x: number; y: number } {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x, y }
}

/**
 * Convert tile coordinates to world position (for ProceduralTileTerrain)
 * This calculates where a tile should be positioned in 3D world space
 * @param tileX Tile X coordinate
 * @param tileY Tile Y coordinate
 * @param zoom Zoom level (default: 13)
 * @returns World position [x, y, z] where y is height (0 for ground level)
 */
export function tileCoordsToWorldPosition(
  tileX: number,
  tileY: number,
  zoom: number = 13
): [number, number, number] {
  const centerTile = latLngToTileCoords(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
  const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
  
  // Calculate tile's world position
  // Tile (x, y) relative to center tile
  const tileOffsetX = tileX - centerTile.x
  const tileOffsetY = tileY - centerTile.y
  
  // World position: center tile is at (0, 0, 0)
  const worldX = tileOffsetX * metersPerTile
  const worldZ = tileOffsetY * metersPerTile
  
  return [worldX, 0, worldZ]
}

/**
 * Get tile information for a specific geographical location
 * This is the main function to use when you want to know which tile contains a lat/lng
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param zoom Zoom level (default: 13)
 * @returns Complete tile information including coordinates and world position
 */
export function getTileForLocation(
  lat: number,
  lng: number,
  zoom: number = 13
): {
  tile: { x: number; y: number }
  worldPosition: [number, number, number]
  metersPerTile: number
  tileKey: string
} {
  const tile = latLngToTileCoords(lat, lng, zoom)
  const worldPosition = tileCoordsToWorldPosition(tile.x, tile.y, zoom)
  const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
  const tileKey = `${zoom}_${tile.x}_${tile.y}`
  
  return {
    tile,
    worldPosition,
    metersPerTile,
    tileKey
  }
}

/**
 * Convert degrees/minutes/seconds to decimal degrees
 * Useful for converting coordinates like "52°56'13.7"S 70°50'58.7"W"
 * @param degrees Degrees component
 * @param minutes Minutes component
 * @param seconds Seconds component
 * @param isSouthOrWest Whether this is South (for lat) or West (for lng) - makes it negative
 * @returns Decimal degrees
 */
export function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  isSouthOrWest: boolean = false
): number {
  const decimal = degrees + minutes / 60 + seconds / 3600
  return isSouthOrWest ? -decimal : decimal
}
