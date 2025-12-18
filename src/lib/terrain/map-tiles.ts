/**
 * Map tile utilities for loading satellite imagery and terrain data
 * Uses OpenStreetMap and other tile services for georeferenced imagery
 */

import { CORRIDOR_BOUNDS, TERRAIN_CENTER, TERRAIN_SIZE } from './coordinates'

/**
 * Convert lat/lng to tile coordinates
 */
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x, y }
}

/**
 * Get tile URL for satellite imagery
 * Using OpenStreetMap as base (can be replaced with Mapbox, Google, etc.)
 */
export function getSatelliteTileUrl(x: number, y: number, zoom: number): string {
  // Using OpenStreetMap tile server (free, no API key needed)
  // For production, consider using Mapbox, Google Maps, or other services
  const subdomain = ['a', 'b', 'c'][Math.floor(Math.random() * 3)]
  return `https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
}

/**
 * Get Mapbox API key from environment
 */
function getMapboxApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MAPBOX_API_KEY || null
  }
  return null
}

/**
 * Get satellite imagery tile URL (alternative services)
 * Tries multiple services for reliability
 * Priority: ESRI → Bing → Google → Mapbox → Maxar
 * ESRI World Imagery is the most reliable and clear for terrain/islands
 */
export function getSatelliteImageryUrl(x: number, y: number, zoom: number, service: 'here' | 'tomtom' | 'mapbox' | 'bing' | 'esri' | 'google' | 'maxar' | 'nasa' | 'cartodb' | 'osm' = 'esri'): string {
  // ESRI World Imagery - PRIMARY: Most reliable and clear satellite imagery for terrain
  if (service === 'google') {
    // Google Satellite - looks exactly like Google Maps satellite view
    // Using satellite layer (lyrs=s) for pure satellite imagery
    // Also supports hybrid (lyrs=y) which includes labels, but we use pure satellite
    // Try different subdomains for better quality and load balancing
    const subdomains = [0, 1, 2, 3]
    const subdomain = subdomains[(x + y) % subdomains.length]
    // Google Maps satellite tiles - most realistic, up-to-date imagery
    return `https://mt${subdomain}.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${zoom}`
  }
  
  // Bing Maps Aerial - SECONDARY: High quality satellite imagery
  if (service === 'bing') {
    // Bing Maps Aerial Imagery (high quality satellite, often clearer)
    // Using quadkey format for Bing Maps tiles
    const quadkey = getQuadKey(x, y, zoom)
    const subdomain = (x + y) % 4 // Use different subdomains for load balancing
    return `https://t${subdomain}.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${quadkey}?mkt=en-US&it=A&og=2&n=z`
  }
  
  // ESRI World Imagery - PRIMARY: Most reliable and clear satellite imagery
  if (service === 'esri') {
    // ESRI World Imagery (satellite) - high quality, no clouds, very clear
    // Use server.arcgisonline.com which allows CORS (basemaps.arcgis.com blocks CORS)
    const endpoints = [
      'server.arcgisonline.com',
      'services.arcgisonline.com'
    ]
    const endpoint = endpoints[(x + y) % endpoints.length]
    return `https://${endpoint}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
  }
  
  // HERE Satellite - requires API key, skip if not available
  if (service === 'here') {
    // HERE provides excellent realistic satellite imagery but requires API key
    // Skip for now - would need API key
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
  }
  
  // TomTom Satellite - requires API key, skip if not available
  if (service === 'tomtom') {
    // TomTom provides high-quality satellite imagery but requires API key
    // Skip for now - would need API key
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
  }
  
  // OpenStreetMap satellite layer - fallback
  if (service === 'osm') {
    // Use OSM as last resort
    const subdomains = ['a', 'b', 'c']
    const subdomain = subdomains[(x + y) % subdomains.length]
    return `https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
  }
  if (service === 'mapbox') {
    // Mapbox Satellite (high quality, requires API key)
    const apiKey = getMapboxApiKey()
    if (apiKey) {
      // Try regular tiles first (sometimes clearer than @2x)
      return `https://api.mapbox.com/v4/mapbox.satellite/${zoom}/${x}/${y}.png?access_token=${apiKey}`
    }
    // Fallback to ESRI if no API key
    console.warn('[MapTiles] Mapbox API key not found, falling back to ESRI')
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
  }
  if (service === 'maxar') {
    // Maxar/DigitalGlobe - Very high quality, clear satellite imagery
    // Using ESRI's Maxar imagery service (same as ESRI World Imagery)
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
  }
  if (service === 'nasa') {
    // NASA Worldview - Clear satellite imagery
    // Using alternative NASA tile service
    return `https://map1.vis.earthdata.nasa.gov/wmts-geo/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/250m/${zoom}/${y}/${x}.jpg`
  }
  if (service === 'cartodb') {
    // CartoDB Positron (satellite alternative)
    return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`
  }
  // ESRI as default
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
}

/**
 * Convert tile coordinates to Bing QuadKey
 * Used for Bing Maps tile URLs
 */
function getQuadKey(x: number, y: number, zoom: number): string {
  let quadKey = ''
  for (let i = zoom; i > 0; i--) {
    let digit = 0
    const mask = 1 << (i - 1)
    if ((x & mask) !== 0) {
      digit++
    }
    if ((y & mask) !== 0) {
      digit += 2
    }
    quadKey += digit.toString()
  }
  return quadKey
}

/**
 * Calculate required tiles for the terrain area
 */
export function getRequiredTiles(zoom: number = 14): { tiles: Array<{ x: number; y: number }>, bounds: { minX: number; maxX: number; minY: number; maxY: number } } {
  const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MapTiles] Loading tiles for Cabo Negro, Chile:`, {
      center: TERRAIN_CENTER,
      centerTile: centerTile,
      zoom: zoom
    })
  }
  
  // Calculate how many tiles we need for 40km radius
  // At zoom 14, 1 tile ≈ 0.19km (15m per pixel), so we need about 210x210 tiles for 40km
  // But we'll limit to reasonable number and use higher resolution canvas
  const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom)
  const radiusInTiles = Math.ceil(40000 / metersPerTile) // 40km in tiles
  
  // Limit to reasonable number for performance (use larger canvas instead)
  const maxTiles = 150 // Cap at 150 tiles per side for performance (still high quality)
  const actualRadius = Math.min(radiusInTiles, maxTiles)
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MapTiles] Calculating tiles for Cabo Negro, Chile (zoom ${zoom}):`, {
      center: TERRAIN_CENTER,
      centerTile: centerTile,
      metersPerTile: metersPerTile.toFixed(2),
      radiusInTiles,
      actualRadius,
      totalTiles: (actualRadius * 2 + 1) ** 2
    })
  }
  
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

/**
 * Load and composite satellite tiles into a single texture
 */
export async function loadSatelliteTexture(
  canvasSize: number = 4096,
  zoom: number = 13 // Zoom 13 = ~30m per pixel, good balance of detail and coverage
): Promise<HTMLCanvasElement> {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MapTiles] Loading satellite imagery for Cabo Negro, Chile:`, {
      center: TERRAIN_CENTER,
      zoom,
      canvasSize
    })
  }
  
  const { tiles, bounds } = getRequiredTiles(zoom)
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MapTiles] Will load ${tiles.length} tiles covering:`, {
      bounds,
      centerTile: latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom)
    })
  }
  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }
  
  // Calculate tile size on canvas
  const tileCountX = bounds.maxX - bounds.minX + 1
  const tileCountY = bounds.maxY - bounds.minY + 1
  const tileSize = Math.floor(canvasSize / Math.max(tileCountX, tileCountY))
  
  // Load tiles in parallel (limit concurrent requests)
  // Try local tiles first, then online services as fallback
  const loadTile = async (x: number, y: number, retryCount: number = 0): Promise<HTMLImageElement> => {
    // FIRST: Try local tile from /assets/tiles/
    const localTilePath = `/assets/tiles/${zoom}_${x}_${y}.png`
    
    // Try local tile first (only on first attempt)
    if (retryCount === 0) {
      return new Promise((resolve, reject) => {
        const localImg = new Image()
        
        localImg.onload = () => {
            if (localImg.width > 0 && localImg.height > 0) {
              resolve(localImg)
            } else {
              // Invalid local tile, try online
              tryOnline()
            }
          }
          
          localImg.onerror = (error) => {
            // Local tile doesn't exist, try online
            tryOnline()
          }
        
        const tryOnline = () => {
          // Determine available services based on API keys
          const mapboxKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_MAPBOX_API_KEY || null) : null
          const services: Array<'google' | 'bing' | 'esri' | 'mapbox' | 'here' | 'tomtom' | 'osm' | 'maxar' | 'nasa' | 'cartodb'> = []
          
          // PRIORITY: ESRI World Imagery - Most reliable and clear for terrain/islands
          services.push('esri', 'esri', 'esri', 'esri')
          
          // Secondary: Bing Maps Aerial
          services.push('bing', 'bing')
          
          // Tertiary: Google Satellite
          services.push('google', 'google')
          
          // Add Mapbox if API key is available
          if (mapboxKey) {
            services.push('mapbox', 'mapbox')
          }
          
          // Fallbacks
          services.push('maxar', 'maxar')
          
          const service = services[retryCount % services.length]
          const tileUrl = getSatelliteImageryUrl(x, y, zoom, service)
          
          const onlineImg = new Image()
          onlineImg.crossOrigin = 'anonymous'
          
          onlineImg.onload = () => {
            if (onlineImg.width > 0 && onlineImg.height > 0) {
              if (onlineImg.width === 256 && onlineImg.height === 256) {
                // Verify it's not a placeholder
                const testCanvas = document.createElement('canvas')
                testCanvas.width = 1
                testCanvas.height = 1
                const testCtx = testCanvas.getContext('2d')
                if (testCtx) {
                  testCtx.drawImage(onlineImg, 0, 0, 1, 1)
                  const pixel = testCtx.getImageData(0, 0, 1, 1).data
                  const r = pixel[0]
                  const g = pixel[1]
                  const b = pixel[2]
                  const isPlaceholder = Math.abs(r - 204) < 5 && Math.abs(g - 204) < 5 && Math.abs(b - 204) < 5
                  
                  if (isPlaceholder) {
                    // Try next service
                    if (retryCount < services.length - 1) {
                      loadTile(x, y, retryCount + 1).then(resolve).catch(reject)
                      return
                    }
                  }
                }
              }
              resolve(onlineImg)
            } else {
              // Try next service
              if (retryCount < services.length - 1) {
                loadTile(x, y, retryCount + 1).then(resolve).catch(reject)
              } else {
                reject(new Error(`Failed to load tile ${x}/${y}`))
              }
            }
          }
          
          onlineImg.onerror = () => {
            // Try next service if available
            if (retryCount < services.length - 1) {
              loadTile(x, y, retryCount + 1).then(resolve).catch(reject)
            } else {
              // All services failed, create placeholder
              const placeholder = document.createElement('canvas')
              placeholder.width = 256
              placeholder.height = 256
              const placeholderCtx = placeholder.getContext('2d')
              if (placeholderCtx) {
                placeholderCtx.fillStyle = '#cccccc'
                placeholderCtx.fillRect(0, 0, 256, 256)
              }
              const placeholderImg = new Image()
              placeholderImg.src = placeholder.toDataURL()
              placeholderImg.onload = () => resolve(placeholderImg)
              placeholderImg.onerror = () => reject(new Error(`Failed to load tile ${x}/${y}`))
            }
          }
          
          onlineImg.src = tileUrl
        }
        
        // Try local first
        localImg.src = localTilePath
      })
    }
    
    // If retryCount > 0, we're already trying online services
    // This shouldn't happen with the new logic, but keep for safety
    const mapboxKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_MAPBOX_API_KEY || null) : null
    const services: Array<'google' | 'bing' | 'esri' | 'mapbox' | 'here' | 'tomtom' | 'osm' | 'maxar' | 'nasa' | 'cartodb'> = []
    services.push('esri', 'esri', 'esri', 'esri', 'bing', 'bing', 'google', 'google')
    if (mapboxKey) services.push('mapbox', 'mapbox')
    services.push('maxar', 'maxar')
    
    const service = services[retryCount % services.length]
    const tileUrl = getSatelliteImageryUrl(x, y, zoom, service)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        if (img.width > 0 && img.height > 0) {
          resolve(img)
        } else {
          if (retryCount < services.length - 1) {
            loadTile(x, y, retryCount + 1).then(resolve).catch(reject)
          } else {
            reject(new Error(`Failed to load tile ${x}/${y}`))
          }
        }
      }
      
      img.onerror = () => {
        if (retryCount < services.length - 1) {
          loadTile(x, y, retryCount + 1).then(resolve).catch(reject)
        } else {
          const placeholder = document.createElement('canvas')
          placeholder.width = 256
          placeholder.height = 256
          const placeholderCtx = placeholder.getContext('2d')
          if (placeholderCtx) {
            placeholderCtx.fillStyle = '#cccccc'
            placeholderCtx.fillRect(0, 0, 256, 256)
          }
          const placeholderImg = new Image()
          placeholderImg.src = placeholder.toDataURL()
          placeholderImg.onload = () => resolve(placeholderImg)
          placeholderImg.onerror = () => reject(new Error(`Failed to load tile ${x}/${y}`))
        }
      }
      
      img.src = tileUrl
    })
  }
  
  // Load tiles with concurrency limit
  const concurrency = 8 // Increased for faster loading
  let loadedCount = 0
  let failedCount = 0
  const serviceStats: Record<string, { success: number; failed: number }> = {}
  const tileLoadDetails: Array<{ x: number; y: number; service: string; success: boolean; time: number }> = []
  
  // Update loading progress
  const updateProgress = () => {
    if (typeof window !== 'undefined' && (window as any).__loadingState) {
      const progress = Math.round((loadedCount / tiles.length) * 100)
      ;(window as any).__loadingState = {
        ...(window as any).__loadingState,
        satelliteTiles: {
          loaded: false,
          message: `Loading satellite imagery tiles... (${loadedCount}/${tiles.length})`,
          progress
        }
      }
    }
  }
  
  // Silent start - only log summary at end
  
  for (let i = 0; i < tiles.length; i += concurrency) {
    const batch = tiles.slice(i, i + concurrency)
    const batchStartTime = Date.now()
    const batchPromises = batch.map(async (tile, idx) => {
      const tileStartTime = Date.now()
      try {
        // Track which service was used for this tile
        let usedService = 'unknown'
        const img = await loadTile(tile.x, tile.y)
        const tileLoadTime = Date.now() - tileStartTime
        
        // Try to determine which service succeeded by checking the image source
        // This is approximate but helps with debugging
        const mapboxKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_MAPBOX_API_KEY || null) : null
        if (mapboxKey && img.src.includes('mapbox')) {
          usedService = 'mapbox'
        } else if (img.src.includes('virtualearth') || img.src.includes('bing')) {
          usedService = 'bing'
        } else if (img.src.includes('arcgisonline') || img.src.includes('esri')) {
          usedService = 'esri'
        } else if (img.src.includes('google')) {
          usedService = 'google'
        } else if (img.src.includes('cartocdn')) {
          usedService = 'cartodb'
        } else if (img.src.includes('nasa')) {
          usedService = 'nasa'
        } else if (img.src.includes('data:image')) {
          usedService = 'placeholder'
        }
        
        if (!serviceStats[usedService]) {
          serviceStats[usedService] = { success: 0, failed: 0 }
        }
        serviceStats[usedService].success++
        
        tileLoadDetails.push({
          x: tile.x,
          y: tile.y,
          service: usedService,
          success: true,
          time: tileLoadTime
        })
        
        const canvasX = (tile.x - bounds.minX) * tileSize
        const canvasY = (tile.y - bounds.minY) * tileSize
        ctx.drawImage(img, canvasX, canvasY, tileSize, tileSize)
        loadedCount++
        
        // Update progress
        updateProgress()
        
        // Silent progress - only log at completion
      } catch (error) {
        failedCount++
        const tileLoadTime = Date.now() - tileStartTime
        tileLoadDetails.push({
          x: tile.x,
          y: tile.y,
          service: 'failed',
          success: false,
          time: tileLoadTime
        })
        console.error(`[MapTiles] ❌ CRITICAL: Failed to process tile ${tile.x}/${tile.y}`, {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    })
    await Promise.all(batchPromises)
  }
  
  // Calculate success rate
  const successRate = tiles.length > 0 ? (loadedCount / tiles.length) * 100 : 0
  
  // Only log if there are significant issues
  if (successRate < 50) {
    console.error(`[MapTiles] Low success rate: ${successRate.toFixed(1)}% (${loadedCount}/${tiles.length} tiles)`)
  } else if (successRate < 80) {
    console.warn(`[MapTiles] Moderate success rate: ${successRate.toFixed(1)}% (${loadedCount}/${tiles.length} tiles)`)
  }
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[MapTiles] Satellite texture canvas created:', {
      width: canvas.width,
      height: canvas.height,
      tileCount: tiles.length,
      bounds
    })
  }
  
  // Verify canvas has content (not all black/empty)
  const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height))
  let hasContent = false
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i]
    const g = imageData.data[i + 1]
    const b = imageData.data[i + 2]
    // Check if pixel is not black (allowing for very dark pixels)
    if (r > 10 || g > 10 || b > 10) {
      hasContent = true
      break
    }
  }
  
  if (!hasContent) {
    console.warn('[MapTiles] Canvas appears to be empty or all black - tiles may not have loaded')
  } else {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[MapTiles] ✓ Canvas has visible content')
    }
  }
  
  return canvas
}

