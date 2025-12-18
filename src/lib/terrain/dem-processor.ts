/**
 * DEM (Digital Elevation Model) data processing utilities
 * Helper functions for processing DEM data from various sources
 */

import * as THREE from 'three'

/**
 * DEM processing configuration
 */
export interface DEMConfig {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  resolution?: number // meters per pixel
  outputWidth?: number
  outputHeight?: number
}

/**
 * Default configuration for Cabo Negro to Punta Arenas corridor
 */
export const CORRIDOR_DEM_CONFIG: DEMConfig = {
  minLat: -53.2,
  maxLat: -52.6,
  minLng: -71.2,
  maxLng: -70.4,
  resolution: 50, // 50 meters per pixel for low-poly
  outputWidth: 1024,
  outputHeight: 1024,
}

/**
 * Convert DEM height value to normalized 0-255 range
 */
export function normalizeDEMHeight(
  heightValue: number,
  minHeight: number,
  maxHeight: number
): number {
  if (maxHeight === minHeight) return 128
  const normalized = (heightValue - minHeight) / (maxHeight - minHeight)
  return Math.floor(Math.max(0, Math.min(255, normalized * 255)))
}

/**
 * Create heightmap texture from DEM data array
 * @param heightData Array of height values
 * @param width Width of the heightmap
 * @param height Height of the heightmap
 * @param minHeight Minimum height value
 * @param maxHeight Maximum height value
 */
export function createHeightmapFromDEM(
  heightData: Float32Array | number[],
  width: number,
  height: number,
  minHeight: number = 0,
  maxHeight: number = 1000
): THREE.DataTexture {
  const size = width * height
  const data = new Uint8Array(size)

  for (let i = 0; i < size; i++) {
    data[i] = normalizeDEMHeight(heightData[i], minHeight, maxHeight)
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RedFormat)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true

  return texture
}

/**
 * Process GeoTIFF DEM data (for use with external tools like QGIS)
 * This is a placeholder - actual processing would be done in QGIS/Python
 * 
 * Processing steps (to be done in QGIS):
 * 1. Load GeoTIFF DEM
 * 2. Clip to bounding box
 * 3. Resample to target resolution (50-100m for low-poly)
 * 4. Normalize values
 * 5. Export as PNG heightmap
 */
export const DEM_PROCESSING_INSTRUCTIONS = `
DEM Processing Instructions (QGIS):

1. Download DEM Data:
   - Source: Copernicus GLO-30 or SRTM
   - Area: -53.2° to -52.6° lat, -71.2° to -70.4° lng
   - Format: GeoTIFF

2. In QGIS:
   - Load GeoTIFF: Layer > Add Layer > Add Raster Layer
   - Clip: Raster > Extraction > Clip Raster by Extent
     - Extent: -71.2, -53.2, -70.4, -52.6 (xmin, ymin, xmax, ymax)
   - Resample: Raster > Projections > Warp (Reproject)
     - Target resolution: 50-100 meters
     - Output size: 1024x1024 pixels
   - Normalize: Raster > Raster Calculator
     - Formula: (DEM - min) / (max - min) * 255
   - Export: Right-click layer > Export > Save As
     - Format: PNG
     - Color: Grayscale
     - Output: punta-arenas-cabonegro-heightmap.png

3. Place exported PNG in: public/assets/terrain/
`
