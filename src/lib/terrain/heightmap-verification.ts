/**
 * Heightmap verification and georeferencing utilities
 * Helps verify that heightmap data matches the target geographic area
 */

import { TERRAIN_CENTER, CORRIDOR_BOUNDS, TERRAIN_SIZE } from './coordinates'

/**
 * Expected geographic bounds for the heightmap
 * The heightmap should cover these exact coordinates
 */
export const EXPECTED_HEIGHTMAP_BOUNDS = {
  center: TERRAIN_CENTER,
  bounds: CORRIDOR_BOUNDS,
  size: TERRAIN_SIZE, // 80km (40km radius)
  centerPoint: '53°03\'40.4"S 70°52\'42.2"W',
  description: '40km radius around 53°03\'40.4"S 70°52\'42.2"W'
}

/**
 * Verify if a heightmap covers the expected area
 * This is a placeholder - in production, you'd check georeferencing metadata
 */
export function verifyHeightmapCoverage(
  heightmapUrl: string,
  expectedBounds: typeof EXPECTED_HEIGHTMAP_BOUNDS = EXPECTED_HEIGHTMAP_BOUNDS
): {
  isValid: boolean
  warnings: string[]
  recommendations: string[]
} {
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Check if heightmap file exists
  // In a real implementation, you'd load the image and check its dimensions
  // and potentially read georeferencing metadata (if available)
  
  warnings.push(
    'Heightmap georeferencing cannot be automatically verified.',
    'Ensure the heightmap covers the exact area:',
    `  Center: ${expectedBounds.centerPoint}`,
    `  Bounds: ${expectedBounds.bounds.minLat}° to ${expectedBounds.bounds.maxLat}° lat,`,
    `           ${expectedBounds.bounds.minLng}° to ${expectedBounds.bounds.maxLng}° lng`,
    `  Size: ${expectedBounds.size / 1000}km (${expectedBounds.size / 2000}km radius)`
  )
  
  recommendations.push(
    'To get accurate heightmap data:',
    '1. Download DEM data from OpenTopography, USGS, or similar',
    '2. Use QGIS or Python to clip to exact bounds',
    '3. Export as PNG heightmap with proper georeferencing',
    '4. Ensure the heightmap covers exactly 40km radius around the center point'
  )
  
  return {
    isValid: true, // Assume valid for now
    warnings,
    recommendations
  }
}

/**
 * Generate instructions for downloading correct heightmap
 */
export function getHeightmapDownloadInstructions(): string {
  return `
To get the correct heightmap for 53°03'40.4"S 70°52'42.2"W (40km radius):

1. OpenTopography (https://opentopography.org/):
   - Select "SRTM" or "ASTER GDEM" dataset
   - Set bounds: 
     * Latitude: ${CORRIDOR_BOUNDS.minLat} to ${CORRIDOR_BOUNDS.maxLat}
     * Longitude: ${CORRIDOR_BOUNDS.minLng} to ${CORRIDOR_BOUNDS.maxLng}
   - Download as GeoTIFF
   - Process with QGIS or Python script to convert to PNG heightmap

2. USGS EarthExplorer:
   - Search for "SRTM" or "ASTER" data
   - Set area of interest to the bounds above
   - Download and process

3. Use the provided Python script:
   - scripts/download-dem-opentopography.py
   - scripts/process-dem-to-heightmap.py
   - These will download and process DEM data automatically

The heightmap should be:
- Size: ~2048x2048 pixels (or higher for detail)
- Format: PNG grayscale (0-255 = height)
- Coverage: Exactly 40km radius around center point
- Georeferenced: Must match the coordinates above
`
}

