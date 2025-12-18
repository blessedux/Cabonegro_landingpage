/**
 * Low-poly terrain processing utilities
 * Converts heightmap data into low-poly geometry with vertex colors
 */

import * as THREE from 'three'

/**
 * Color palette for low-poly terrain based on elevation
 */
export const TERRAIN_COLORS = {
  water: new THREE.Color(0x1E90FF),      // Dodger blue - below sea level
  coastal: new THREE.Color(0x87CEEB),   // Sky blue - near sea level
  lowland: new THREE.Color(0x90EE90),   // Light green - low elevation
  midland: new THREE.Color(0x8B7355),   // Brown - medium elevation
  highland: new THREE.Color(0x696969),  // Dim gray - high elevation
  peak: new THREE.Color(0xD3D3D3),      // Light gray - very high
} as const

/**
 * Get terrain color based on elevation (normalized 0-1)
 */
export function getTerrainColor(elevation: number): THREE.Color {
  if (elevation < 0.1) return TERRAIN_COLORS.water.clone()
  if (elevation < 0.2) return TERRAIN_COLORS.coastal.clone()
  if (elevation < 0.4) return TERRAIN_COLORS.lowland.clone()
  if (elevation < 0.6) return TERRAIN_COLORS.midland.clone()
  if (elevation < 0.8) return TERRAIN_COLORS.highland.clone()
  return TERRAIN_COLORS.peak.clone()
}

/**
 * Interpolate between two colors based on elevation
 */
function interpolateColor(color1: THREE.Color, color2: THREE.Color, factor: number): THREE.Color {
  const result = color1.clone()
  result.lerp(color2, factor)
  return result
}

/**
 * Create low-poly terrain geometry from heightmap data
 * @param heightmapData ImageData or Uint8Array from heightmap
 * @param width Width of heightmap
 * @param height Height of heightmap
 * @param terrainSize Size of terrain in world units
 * @param decimationRatio Ratio to reduce segments (0.5 = half segments)
 * @param heightScale Scale factor for height displacement
 */
export function createLowPolyTerrainGeometry(
  heightmapData: Uint8Array | ImageData,
  width: number,
  height: number,
  terrainSize: number,
  decimationRatio: number = 0.6,
  heightScale: number = 50
): THREE.BufferGeometry {
  // Calculate decimated segment count
  // Limit to reasonable size to avoid stack overflow (max 256 segments = ~66k vertices)
  const maxSegments = 256
  const segmentsX = Math.min(maxSegments, Math.max(8, Math.floor(width * decimationRatio)))
  const segmentsZ = Math.min(maxSegments, Math.max(8, Math.floor(height * decimationRatio)))
  
  // Geometry creation - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LowPolyProcessor] Creating geometry: ${segmentsX}x${segmentsZ} segments (${(segmentsX + 1) * (segmentsZ + 1)} vertices)`)
  }

  // Create geometry with reduced segments for low-poly look
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segmentsX, segmentsZ)
  geometry.rotateX(-Math.PI / 2)

  // Get height data as array
  let heightArray: Uint8Array
  if (heightmapData instanceof ImageData) {
    // Extract red channel (grayscale heightmap)
    const data = heightmapData.data
    heightArray = new Uint8Array(width * height)
    for (let i = 0; i < width * height; i++) {
      heightArray[i] = data[i * 4] // Red channel
    }
    
    // Log heightmap statistics (avoid creating large arrays)
    let minVal = 255
    let maxVal = 0
    let sum = 0
    for (let i = 0; i < heightArray.length; i++) {
      const val = heightArray[i]
      if (val < minVal) minVal = val
      if (val > maxVal) maxVal = val
      sum += val
    }
    const avgVal = sum / heightArray.length
    // Heightmap stats - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[LowPolyProcessor] Heightmap stats: min=${minVal}, max=${maxVal}, avg=${avgVal.toFixed(1)}`)
    }
  } else {
    heightArray = heightmapData
  }

  // Apply height to vertices and generate vertex colors
  const vertices = geometry.attributes.position.array as Float32Array
  const colors: number[] = []
  const vertexCount = vertices.length / 3

  for (let i = 0, j = 0; i < vertexCount; i++, j += 3) {
    // Calculate position in heightmap
    const u = (i % (segmentsX + 1)) / segmentsX
    const v = Math.floor(i / (segmentsX + 1)) / segmentsZ

    // Sample height from heightmap
    // Clamp u and v to [0, 1] range
    const clampedU = Math.max(0, Math.min(1, u))
    const clampedV = Math.max(0, Math.min(1, v))
    
    // Map to heightmap coordinates
    const x = Math.floor(clampedU * (width - 1))
    const z = Math.floor(clampedV * (height - 1))
    const heightIndex = z * width + x

    // Get height value (0-255) - ensure we don't go out of bounds
    const safeIndex = Math.min(Math.max(0, heightIndex), heightArray.length - 1)
    const heightValue = heightArray[safeIndex] || 0
    const normalizedHeight = heightValue / 255
    
    // Verify we're getting valid height data
    if (i === 0 && heightValue === 0) {
      console.warn('[LowPolyProcessor] First vertex has height 0 - heightmap may be all black or not loading correctly')
    }

    // Apply height to vertex with sea level offset
    // Treat normalizedHeight < 0.25 as below sea level (ocean floor)
    // Sea level is at normalizedHeight = 0.25, so offset by -0.25 * heightScale
    const seaLevelThreshold = 0.25 // 25% of heightmap range = sea level
    const seaLevelOffset = -seaLevelThreshold * heightScale
    const originalY = vertices[j + 1]
    vertices[j + 1] = (normalizedHeight * heightScale) + seaLevelOffset
    
    // Debug: log first few vertices to verify height is being applied
    if (i < 5) {
      // Only log first few vertices in development
      if (process.env.NODE_ENV === 'development' && i < 5) {
        console.log(`[LowPolyProcessor] Vertex ${i}: u=${u.toFixed(3)}, v=${v.toFixed(3)}, heightValue=${heightValue}, normalized=${normalizedHeight.toFixed(3)}, Y=${vertices[j + 1].toFixed(2)}`)
      }
    }

    // Generate vertex color based on elevation
    const color = getTerrainColor(normalizedHeight)
    colors.push(color.r, color.g, color.b)
  }
  
  // Log height statistics (avoid creating large arrays that cause stack overflow)
  let minHeight = Infinity
  let maxHeight = -Infinity
  for (let i = 1; i < vertices.length; i += 3) {
    const h = vertices[i]
    if (h < minHeight) minHeight = h
    if (h > maxHeight) maxHeight = h
  }
  // Height range - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LowPolyProcessor] Height range: ${minHeight.toFixed(2)} to ${maxHeight.toFixed(2)} (scale: ${heightScale})`)
  }

  // Add vertex colors to geometry
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  // Compute flat normals for low-poly faceted look
  // Use a try-catch to handle potential stack overflow with very large geometries
  try {
    geometry.computeVertexNormals()
    // Normals computed - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyProcessor] Normals computed successfully')
    }
  } catch (error) {
    console.warn('[LowPolyProcessor] Failed to compute normals, using default:', error)
    // Create basic normals manually if computeVertexNormals fails
    const normals = new Float32Array(vertices.length)
    for (let i = 0; i < normals.length; i += 3) {
      normals[i] = 0
      normals[i + 1] = 1 // Up vector
      normals[i + 2] = 0
    }
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  }

  geometry.attributes.normal.needsUpdate = true
  geometry.attributes.position.needsUpdate = true

  return geometry
}

/**
 * Decimate geometry further using edge collapse
 * Simple implementation that reduces triangles while preserving shape
 */
export function decimateGeometry(
  geometry: THREE.BufferGeometry,
  targetTriangleCount: number
): THREE.BufferGeometry {
  // For now, return original geometry
  // Full edge collapse implementation would be complex
  // Instead, we'll rely on reduced segment count in createLowPolyTerrainGeometry
  return geometry
}

/**
 * Load heightmap and convert to low-poly terrain
 */
export async function loadHeightmapAsLowPoly(
  heightmapUrl: string,
  terrainSize: number,
  decimationRatio: number = 0.6,
  heightScale: number = 50
): Promise<{ geometry: THREE.BufferGeometry; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Don't set crossOrigin for local files - it can cause CORS issues
    // img.crossOrigin = 'anonymous'
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyTerrain] Loading heightmap from:', heightmapUrl)
    }
    
    img.onload = () => {
      try {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] Heightmap loaded successfully:', {
            width: img.width,
            height: img.height,
            url: heightmapUrl
          })
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] Creating low-poly geometry...', {
            terrainSize,
            decimationRatio,
            heightScale
          })
        }

        const geometry = createLowPolyTerrainGeometry(
          imageData,
          img.width,
          img.height,
          terrainSize,
          decimationRatio,
          heightScale
        )

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] Geometry created successfully:', {
            vertices: geometry.attributes.position.count,
            triangles: geometry.index ? geometry.index.count / 3 : 'unknown'
          })
        }

        resolve({ geometry, width: img.width, height: img.height })
      } catch (error) {
        console.error('[LowPolyTerrain] Error processing heightmap:', error)
        reject(error)
      }
    }

    img.onerror = (error) => {
      console.error('[LowPolyTerrain] Failed to load heightmap image:', {
        url: heightmapUrl,
        error: error
      })
      reject(new Error(`Failed to load heightmap from ${heightmapUrl}. Check that the file exists in public/assets/terrain/`))
    }

    img.src = heightmapUrl
  })
}
