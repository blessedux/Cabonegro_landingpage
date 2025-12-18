'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TERRAIN_SIZE, TERRAIN_CENTER } from '@/lib/terrain/coordinates'
import { loadHeightmapAsLowPoly } from '@/lib/terrain/low-poly-processor'

interface LowPolyTerrainProps {
  heightmapUrl?: string
  terrainSize?: number
  decimationRatio?: number
  heightScale?: number
  fadeDistance?: number // Distance from center where fade starts (0 = no fade)
  terrainCenter?: [number, number] // Center point in world space [x, z]
}

export default function LowPolyTerrain({
  heightmapUrl = '/assets/terrain/punta-arenas-cabonegro-heightmap.png',
  terrainSize = TERRAIN_SIZE,
  decimationRatio = 0.3, // Reduced for better performance and to avoid stack overflow
  heightScale = 1500, // Exaggerated for better visibility of real-world topography
  fadeDistance = 0, // 0 = no fade, >0 = distance from center where fade starts
  terrainCenter = [0, 0] // Center point in world space [x, z]
}: LowPolyTerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [materialReady, setMaterialReady] = useState(false)

  // Expose mesh ref for terrain raycasting (used by Buildings component)
  // This runs after mesh is rendered, so we check meshRef.current directly
  useEffect(() => {
    const updateTerrainMeshRef = () => {
      if (meshRef.current && 
          meshRef.current.geometry && 
          meshRef.current.material &&
          meshRef.current.geometry.attributes.position &&
          meshRef.current.geometry.attributes.position.count > 0) {
      ;(window as any).__terrainMesh = meshRef.current
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] ✓ Terrain mesh exposed to window.__terrainMesh:', {
            hasGeometry: !!meshRef.current.geometry,
            hasMaterial: !!meshRef.current.material,
            vertices: meshRef.current.geometry.attributes.position.count
          })
        }
      } else {
        // Clear if not ready
        if ((window as any).__terrainMesh) {
          delete (window as any).__terrainMesh
        }
      }
    }
    
    // Check immediately
    updateTerrainMeshRef()
    
    // Also check periodically in case mesh updates
    const interval = setInterval(updateTerrainMeshRef, 500)
    
    return () => {
      clearInterval(interval)
      delete (window as any).__terrainMesh
    }
  }, []) // Empty deps - we check meshRef.current directly

  // Load heightmap and create low-poly geometry
  useEffect(() => {
    setIsLoading(true)
    
    // First, test if the image is accessible
    const testImg = new Image()
    testImg.onload = () => {
      // Now load with the processor
      loadHeightmapAsLowPoly(heightmapUrl, terrainSize, decimationRatio, heightScale)
        .then(({ geometry: geo }) => {
          
          // Verify geometry has height variation
          const positions = geo.attributes.position.array as Float32Array
          let minY = Infinity
          let maxY = -Infinity
          for (let i = 1; i < positions.length; i += 3) {
            const y = positions[i]
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
          if (maxY - minY < 1) {
            console.warn('[LowPolyTerrain] Terrain appears flat - height variation is very small')
          }
          
          setGeometry(geo)
          setIsLoading(false)
          
          // Update loading state - terrain loaded
          if (typeof window !== 'undefined' && (window as any).__loadingState) {
            ;(window as any).__loadingState = {
              ...(window as any).__loadingState,
              terrain: { loaded: true, message: 'Terrain heightmap loaded ✓' }
            }
          }
        })
        .catch((error) => {
          console.error('[LowPolyTerrain] Failed to load heightmap:', error)
          // Fallback: create simple flat terrain
          const fallbackGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 16, 16)
          fallbackGeo.rotateX(-Math.PI / 2)
          setGeometry(fallbackGeo)
          setIsLoading(false)
          
          // Update loading state even on error
          if (typeof window !== 'undefined' && (window as any).__loadingState) {
            ;(window as any).__loadingState = {
              ...(window as any).__loadingState,
              terrain: { loaded: true, message: 'Terrain loaded (fallback) ✓' }
            }
          }
        })
    }
    
    testImg.onerror = () => {
      // Still try to load despite test failure
      loadHeightmapAsLowPoly(heightmapUrl, terrainSize, decimationRatio, heightScale)
        .then(({ geometry: geo }) => {
          setGeometry(geo)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('[LowPolyTerrain] ✗ Failed to load, using fallback')
          const fallbackGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, 16, 16)
          fallbackGeo.rotateX(-Math.PI / 2)
          setGeometry(fallbackGeo)
          setIsLoading(false)
        })
    }
    
    testImg.src = heightmapUrl
  }, [heightmapUrl, terrainSize, decimationRatio, heightScale])

  // Calculate min/max height for elevation visualization
  const heightRange = useMemo(() => {
    if (!geometry) return { min: 0, max: 1000 }
    
    const positions = geometry.attributes.position?.array as Float32Array
    if (!positions || positions.length === 0) return { min: 0, max: 1000 }
    
    let minY = Infinity
    let maxY = -Infinity
    
    for (let i = 1; i < positions.length; i += 3) {
      const y = positions[i]
      if (!isNaN(y) && isFinite(y)) {
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
    
    // Ensure valid range
    if (!isFinite(minY) || !isFinite(maxY) || minY === maxY) {
      return { min: 0, max: 1000 }
    }
    
    return { min: minY, max: maxY }
  }, [geometry])

  // Load satellite imagery texture from map tiles
  const [satelliteTexture, setSatelliteTexture] = useState<THREE.Texture | null>(null)
  const [isLoadingSatellite, setIsLoadingSatellite] = useState(true)

  useEffect(() => {
    // Load real satellite imagery tiles for the terrain area
    const loadSatelliteImagery = async () => {
      try {
        setIsLoadingSatellite(true)
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] Loading satellite imagery tiles...')
        }
        
        // Import the map tiles utility
        const { loadSatelliteTexture } = await import('@/lib/terrain/map-tiles')
        
        // Load satellite tiles for zoom level 13 (~30m resolution - excellent for terrain/islands)
        // Zoom 13 = ~30m per pixel - perfect balance of detail and coverage for 80km area
        // Higher zoom = more detail but requires more tiles and may have coverage gaps
        // Priority: ESRI → Bing → Google → Mapbox → Maxar
        // ESRI World Imagery provides the clearest, most reliable satellite imagery for terrain
        const mapboxKey = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_MAPBOX_API_KEY || null) : null
        const sourceList = mapboxKey 
          ? 'ESRI (primary - clear terrain), Bing, Google, Mapbox, Maxar (fallbacks)'
          : 'ESRI (primary - clear terrain), Bing, Google, Maxar (fallbacks)'
        
        // Load satellite imagery with ESRI as primary source
        const canvas = await loadSatelliteTexture(4096, 13)
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] ✅ SATELLITE IMAGERY CANVAS CREATED:', {
            width: canvas.width,
            height: canvas.height,
            source: sourceList,
            zoom: 13,
            location: TERRAIN_CENTER
          })
        }
        
        // Immediately verify canvas has content
        const verifyCtx = canvas.getContext('2d')
        if (verifyCtx) {
          const sampleData = verifyCtx.getImageData(0, 0, Math.min(50, canvas.width), Math.min(50, canvas.height))
          let nonBlackPixels = 0
          let totalPixels = 0
          for (let i = 0; i < sampleData.data.length; i += 4) {
            totalPixels++
            const r = sampleData.data[i]
            const g = sampleData.data[i + 1]
            const b = sampleData.data[i + 2]
            if (r > 10 || g > 10 || b > 10) {
              nonBlackPixels++
            }
          }
          const contentRatio = (nonBlackPixels / totalPixels) * 100
          if (contentRatio < 5) {
            console.error('[LowPolyTerrain] Canvas appears empty - tiles may not have loaded')
          }
        }
        
        // Enhance canvas contrast before creating texture to reduce foggy appearance
        const enhanceCtx = canvas.getContext('2d')
        if (enhanceCtx) {
          const imageData = enhanceCtx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Apply contrast enhancement to reduce foggy look
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast slightly (1.1 = 10% more contrast)
            const factor = 1.1
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            // Apply contrast adjustment (center around 128, multiply difference)
            data[i] = Math.min(255, Math.max(0, (r - 128) * factor + 128))
            data[i + 1] = Math.min(255, Math.max(0, (g - 128) * factor + 128))
            data[i + 2] = Math.min(255, Math.max(0, (b - 128) * factor + 128))
          }
          
          enhanceCtx.putImageData(imageData, 0, 0)
        }
        
        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping // Enable seamless repetition for infinite horizon
        texture.wrapT = THREE.RepeatWrapping
        // Use sharper filtering to reduce blurriness/fogginess
        texture.minFilter = THREE.LinearMipmapNearestFilter // Sharper than LinearMipmapLinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.generateMipmaps = true // Enable mipmaps for better quality
        texture.needsUpdate = true
        texture.flipY = false // Canvas textures don't need flipping
        
        // Store canvas reference for debugging
        ;(texture as any).image = canvas
        ;(texture as any).source = canvas
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] 📸 Satellite texture created:', {
            textureType: texture.constructor.name,
            hasImage: !!(texture as any).image,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            wrapS: texture.wrapS,
            wrapT: texture.wrapT
          })
        }
        
        // Verify texture has actual content (not just placeholders or empty)
        const testCtx = canvas.getContext('2d')
        if (testCtx) {
          // Sample multiple areas of the canvas to verify content
          const sampleSize = Math.min(200, canvas.width, canvas.height)
          const sampleAreas = [
            { x: 0, y: 0 }, // Top-left
            { x: canvas.width - sampleSize, y: 0 }, // Top-right
            { x: 0, y: canvas.height - sampleSize }, // Bottom-left
            { x: canvas.width - sampleSize, y: canvas.height - sampleSize }, // Bottom-right
            { x: Math.floor(canvas.width / 2 - sampleSize / 2), y: Math.floor(canvas.height / 2 - sampleSize / 2) } // Center
          ]
          
          let totalPixels = 0
          let validPixels = 0
          let placeholderPixels = 0
          
          for (const area of sampleAreas) {
            const testData = testCtx.getImageData(area.x, area.y, sampleSize, sampleSize)
            for (let i = 0; i < testData.data.length; i += 4) {
              totalPixels++
              const r = testData.data[i]
              const g = testData.data[i + 1]
              const b = testData.data[i + 2]
              const avg = (r + g + b) / 3
              
              // Check if pixel has content (not black/empty)
              if (r > 10 || g > 10 || b > 10) {
                validPixels++
                // Check if it's a placeholder (very light gray, close to #cccccc)
                if (avg > 200 && Math.abs(r - g) < 5 && Math.abs(g - b) < 5) {
                  placeholderPixels++
                }
              }
            }
          }
          
          const contentRatio = validPixels / totalPixels
          const placeholderRatio = placeholderPixels / totalPixels
          const realContentRatio = contentRatio - placeholderRatio
          
          // Only proceed if we have real content
          if (realContentRatio < 0.05) {
            console.error('[LowPolyTerrain] Texture has insufficient content - mostly placeholders')
            throw new Error('Satellite texture has insufficient real content')
          }
        }
        
        const img = (texture as any).image
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] ✅ Satellite texture created successfully:', {
            width: img?.width || 'unknown',
            height: img?.height || 'unknown',
            hasImage: !!img,
            imageType: img ? img.constructor.name : 'none'
          })
        }
        
        // Verify canvas has actual content before using it
        if (img instanceof HTMLCanvasElement) {
          const verifyCtx = img.getContext('2d')
          if (verifyCtx) {
            const sample = verifyCtx.getImageData(0, 0, Math.min(100, img.width), Math.min(100, img.height))
            let nonBlackPixels = 0
            let totalPixels = 0
            for (let i = 0; i < sample.data.length; i += 4) {
              totalPixels++
              const r = sample.data[i]
              const g = sample.data[i + 1]
              const b = sample.data[i + 2]
              if (r > 5 || g > 5 || b > 5) {
                nonBlackPixels++
              }
            }
            const contentPercent = (nonBlackPixels / totalPixels) * 100
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.log('[LowPolyTerrain] Canvas content verification:', {
                contentPercent: contentPercent.toFixed(2) + '%',
                nonBlackPixels,
                totalPixels,
                hasContent: contentPercent > 1
              })
            }
            
            if (contentPercent < 1) {
              console.error('[LowPolyTerrain] ❌ Canvas appears to be mostly black - tiles may not have loaded!')
            }
          }
        }
        
        setSatelliteTexture(texture)
        
        // Debug: Log texture creation
        console.log('[LowPolyTerrain] 📸 Satellite texture created:', {
          textureType: texture.constructor.name,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          wrapS: texture.wrapS,
          wrapT: texture.wrapT,
          hasImage: !!(texture as any).image,
          imageType: (texture as any).image?.constructor.name
        })
        
        // Verify canvas has content (second check after texture creation)
        const verifyCtx2 = canvas.getContext('2d')
        if (verifyCtx2) {
          const sample = verifyCtx2.getImageData(canvas.width / 2, canvas.height / 2, 10, 10)
          let hasContent = false
          let nonBlackPixels = 0
          for (let i = 0; i < sample.data.length; i += 4) {
            if (sample.data[i] > 10 || sample.data[i + 1] > 10 || sample.data[i + 2] > 10) {
              hasContent = true
              nonBlackPixels++
            }
          }
          console.log('[LowPolyTerrain] Canvas content check:', {
            hasContent,
            nonBlackPixels: `${nonBlackPixels}/${sample.data.length / 4}`,
            samplePixel: `rgb(${sample.data[0]}, ${sample.data[1]}, ${sample.data[2]})`,
            canvasSize: `${canvas.width}x${canvas.height}`
          })
          
          // Expose canvas to window for debugging
          if (typeof window !== 'undefined') {
            ;(window as any).__satelliteCanvas = canvas
            console.log('[LowPolyTerrain] 💡 Debug: Canvas exposed to window.__satelliteCanvas - inspect in console')
          }
        }
        
        // Update loading state - satellite tiles loaded
        if (typeof window !== 'undefined' && (window as any).__loadingState) {
          ;(window as any).__loadingState = {
            ...(window as any).__loadingState,
            satelliteTiles: { loaded: true, message: 'Satellite imagery loaded ✓', progress: 100 }
          }
        }
        setIsLoadingSatellite(false)
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            console.log('[LowPolyTerrain] 📊 Satellite texture status:', {
              textureSet: !!texture,
              hasImage: !!img,
              imageSize: img ? `${img.width}x${img.height}` : 'none',
              imageType: img ? img.constructor.name : 'none'
            })
          }, 500)
        }
      } catch (error) {
        console.error('[LowPolyTerrain] ❌ Failed to load satellite imagery:', error)
        setSatelliteTexture(null)
        setIsLoadingSatellite(false)
      }
    }
    
    loadSatelliteImagery()
  }, [])

  // Create shader material with elevation visualization and satellite texture overlay
  const material = useMemo(() => {
    if (!geometry) {
      // Fallback material
      const fallback = new THREE.MeshStandardMaterial({
        color: 0x808080, // Grey
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0,
      })
      setMaterialReady(true) // Fallback materials are always ready
      return fallback
    }

    // Create a default black texture if satellite texture isn't loaded yet
    // DataTexture doesn't have an 'image' property, so we need to handle that
    const defaultTexture = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 255]), // Black instead of white
      1,
      1,
      THREE.RGBAFormat
    )
    defaultTexture.needsUpdate = true
    
    // Ensure we always have a valid texture
    // If satelliteTexture exists and has an image, use it; otherwise use default
    const textureToUse = (satelliteTexture && (satelliteTexture as any).image) ? satelliteTexture : defaultTexture

    // Ensure heightRange has valid values
    const safeMinHeight = (heightRange && typeof heightRange.min === 'number' && isFinite(heightRange.min)) ? heightRange.min : 0
    const safeMaxHeight = (heightRange && typeof heightRange.max === 'number' && isFinite(heightRange.max)) ? heightRange.max : 1000
    
    // Ensure we have a valid texture
    if (!textureToUse) {
      console.error('[LowPolyTerrain] No valid texture available, using default')
    }
    
    // Create elevation-based shader material with satellite texture support
    // CRITICAL: Create uniforms directly in ShaderMaterial constructor
    // Three.js requires each uniform to have a .value property that is never undefined
    const finalTexture = textureToUse || defaultTexture
    
    // Determine if we should use satellite texture
    // If satelliteTexture exists and is a CanvasTexture (not the default DataTexture),
    // we should use it - CanvasTexture means we successfully loaded satellite tiles
    const isCanvasTexture = satelliteTexture && 
                            satelliteTexture.constructor.name === 'CanvasTexture' &&
                            satelliteTexture !== defaultTexture
    
    // Additional validation: try to verify it has valid dimensions
    const hasValidDimensions = isCanvasTexture && (
      // Check if it's a CanvasTexture with canvas
      ((satelliteTexture as any).image instanceof HTMLCanvasElement &&
       (satelliteTexture as any).image.width > 0 &&
       (satelliteTexture as any).image.height > 0) ||
      // Or check if texture has valid source/data
      ((satelliteTexture as any).source && 
       (satelliteTexture as any).source instanceof HTMLCanvasElement &&
       (satelliteTexture as any).source.width > 0 &&
       (satelliteTexture as any).source.height > 0) ||
      // Or check if it's a valid texture with imageData
      (satelliteTexture.image && 
       satelliteTexture.image.width > 0 &&
       satelliteTexture.image.height > 0)
    )
    
    // Use satellite if it's a CanvasTexture (we trust it's valid if we created it)
    // Even if we can't verify dimensions, if it's CanvasTexture, enable it
    const hasValidSatelliteTexture = isCanvasTexture
    
    const useSatelliteValue = hasValidSatelliteTexture ? 1.0 : 0.0
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyTerrain] Creating material:', {
        hasValidSatelliteTexture,
        useSatelliteValue,
        hasSatelliteTexture: !!satelliteTexture,
        hasImage: !!(satelliteTexture && (satelliteTexture as any).image),
        imageWidth: satelliteTexture && (satelliteTexture as any).image ? (satelliteTexture as any).image.width : 0
      })
    }
    
    // Validate values before creating material
    if (!isFinite(safeMinHeight) || !isFinite(safeMaxHeight) || !finalTexture || !isFinite(useSatelliteValue)) {
      console.error('[LowPolyTerrain] Invalid uniform values, using fallback material', {
        safeMinHeight,
        safeMaxHeight,
        hasTexture: !!finalTexture,
        useSatelliteValue
      })
      return new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0,
      })
    }
    
    // CRITICAL: Ensure ALL uniforms are defined with valid values BEFORE creating material
    // Three.js will crash if any uniform is undefined or missing .value during shader compilation
    // Create uniforms object with explicit type checking and immediate validation
    
    // Ensure terrainCenter is valid
    const centerX = Array.isArray(terrainCenter) && terrainCenter.length >= 2 ? terrainCenter[0] : 0
    const centerZ = Array.isArray(terrainCenter) && terrainCenter.length >= 2 ? terrainCenter[1] : 0
    const terrainCenterVec = new THREE.Vector2(centerX, centerZ)
    
    // Ensure fadeDistance is valid
    const safeFadeDistance = isFinite(fadeDistance) && fadeDistance >= 0 ? fadeDistance : 0
    
    // CRITICAL: Create uniforms object - ensure ALL uniforms exist and are never undefined
    // Three.js will access these during shader compilation, so they MUST exist
    const uniforms: {
      minHeight: { value: number }
      maxHeight: { value: number }
      satelliteTexture: { value: THREE.Texture }
      useSatellite: { value: number }
      fadeDistance: { value: number }
      terrainCenter: { value: THREE.Vector2 }
    } = {
      minHeight: { value: safeMinHeight },
      maxHeight: { value: safeMaxHeight },
      satelliteTexture: { value: finalTexture },
      useSatellite: { value: useSatelliteValue },
      fadeDistance: { value: safeFadeDistance },
      terrainCenter: { value: terrainCenterVec },
    }
    
    // IMMEDIATE validation - must pass before creating ShaderMaterial
    // Three.js will try to access these during shader compilation
    // Check that each uniform exists AND has a valid value
    const hasAllUniforms = 
      uniforms.minHeight !== undefined &&
      uniforms.maxHeight !== undefined &&
      uniforms.satelliteTexture !== undefined &&
      uniforms.useSatellite !== undefined &&
      uniforms.fadeDistance !== undefined &&
      uniforms.terrainCenter !== undefined &&
      uniforms.minHeight.value !== undefined &&
      uniforms.maxHeight.value !== undefined &&
      uniforms.satelliteTexture.value !== undefined &&
      uniforms.useSatellite.value !== undefined &&
      uniforms.fadeDistance.value !== undefined &&
      uniforms.terrainCenter.value !== undefined
    
    if (!hasAllUniforms ||
        !isFinite(uniforms.minHeight.value) || 
        !isFinite(uniforms.maxHeight.value) || 
        !uniforms.satelliteTexture.value || 
        !isFinite(uniforms.useSatellite.value) ||
        !isFinite(uniforms.fadeDistance.value) ||
        !uniforms.terrainCenter.value ||
        !(uniforms.terrainCenter.value instanceof THREE.Vector2) ||
        typeof uniforms.minHeight.value === 'undefined' ||
        typeof uniforms.maxHeight.value === 'undefined' ||
        uniforms.satelliteTexture.value === undefined ||
        typeof uniforms.useSatellite.value === 'undefined' ||
        typeof uniforms.fadeDistance.value === 'undefined') {
      console.error('[LowPolyTerrain] Invalid uniform values, using fallback material', {
        minHeight: uniforms.minHeight.value,
        maxHeight: uniforms.maxHeight.value,
        hasTexture: !!uniforms.satelliteTexture.value,
        useSatellite: uniforms.useSatellite.value
      })
      const fallback = new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0,
      })
      setMaterialReady(true)
      return fallback
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyTerrain] Creating shader material with uniforms:', {
        useSatellite: uniforms.useSatellite.value,
        hasTexture: !!uniforms.satelliteTexture.value,
        textureType: uniforms.satelliteTexture.value ? uniforms.satelliteTexture.value.constructor.name : 'none',
        minHeight: uniforms.minHeight.value,
        maxHeight: uniforms.maxHeight.value
      })
    }
    
    // Final check - ensure ALL uniforms exist and are valid before creating material
    // Three.js will try to access these during shader compilation, so they MUST all exist
    const allUniformsValid = 
      uniforms.minHeight !== undefined && uniforms.minHeight.value !== undefined &&
      uniforms.maxHeight !== undefined && uniforms.maxHeight.value !== undefined &&
      uniforms.satelliteTexture !== undefined && uniforms.satelliteTexture.value !== undefined &&
      uniforms.useSatellite !== undefined && uniforms.useSatellite.value !== undefined &&
      uniforms.fadeDistance !== undefined && uniforms.fadeDistance.value !== undefined &&
      uniforms.terrainCenter !== undefined && uniforms.terrainCenter.value !== undefined &&
      uniforms.terrainCenter.value instanceof THREE.Vector2
    
    if (!allUniformsValid) {
      console.error('[LowPolyTerrain] ❌ Cannot create material - missing uniforms:', {
        minHeight: !!uniforms.minHeight,
        maxHeight: !!uniforms.maxHeight,
        satelliteTexture: !!uniforms.satelliteTexture,
        useSatellite: !!uniforms.useSatellite,
        fadeDistance: !!uniforms.fadeDistance,
        terrainCenter: !!uniforms.terrainCenter,
        terrainCenterIsVector2: uniforms.terrainCenter?.value instanceof THREE.Vector2
      })
      const fallback = new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0,
      })
      setMaterialReady(true)
      return fallback
    }
    
    // Final check - log all uniforms before creating material
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyTerrain] Creating material with uniforms:', {
        minHeight: uniforms.minHeight?.value,
        maxHeight: uniforms.maxHeight?.value,
        hasSatelliteTexture: !!uniforms.satelliteTexture?.value,
        useSatellite: uniforms.useSatellite?.value,
        fadeDistance: uniforms.fadeDistance?.value,
        terrainCenter: uniforms.terrainCenter?.value,
        allPresent: !!uniforms.minHeight && !!uniforms.maxHeight && !!uniforms.satelliteTexture && !!uniforms.useSatellite && !!uniforms.fadeDistance && !!uniforms.terrainCenter
      })
    }
    
    // Use uniforms directly (they're already validated)
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      visible: false, // Start invisible - useFrame will make it visible when all uniforms are ready
      vertexShader: `
        varying vec3 vPosition;
        varying float vElevation;
        varying vec2 vUv;
        varying float vDistanceFromCenter;
        uniform vec2 terrainCenter;
        
        void main() {
          vPosition = position;
          vElevation = position.y;
          vUv = uv;
          
          // Calculate distance from terrain center (on XZ plane)
          vec2 worldPos = vec2(position.x, position.z);
          vDistanceFromCenter = distance(worldPos, terrainCenter);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float minHeight;
        uniform float maxHeight;
        uniform sampler2D satelliteTexture;
        uniform float useSatellite;
        uniform float fadeDistance;
        
        varying vec3 vPosition;
        varying float vElevation;
        varying vec2 vUv;
        varying float vDistanceFromCenter;
        
        void main() {
          // Normalize elevation to 0-1 range
          float normalizedHeight = (vElevation - minHeight) / (maxHeight - minHeight);
          normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);
          
          // Create natural color based on elevation
          // Lower elevations = darker brown/green, higher elevations = lighter grey/brown
          // Made more vibrant so terrain is always visible
          vec3 lowElevationColor = vec3(0.3, 0.35, 0.25); // Dark green-brown (brighter)
          vec3 midElevationColor = vec3(0.5, 0.55, 0.45); // Medium brown-green (brighter)
          vec3 highElevationColor = vec3(0.7, 0.7, 0.65); // Light grey-brown (brighter)
          
          vec3 elevationColor;
          if (normalizedHeight < 0.5) {
            // Blend between low and mid
            elevationColor = mix(lowElevationColor, midElevationColor, normalizedHeight * 2.0);
          } else {
            // Blend between mid and high
            elevationColor = mix(midElevationColor, highElevationColor, (normalizedHeight - 0.5) * 2.0);
          }
          
          // Mix with satellite texture if available
          vec3 finalColor = elevationColor;
          if (useSatellite > 0.5) {
            // Sample satellite texture - ALWAYS use it if enabled
            vec4 satelliteSample = texture2D(satelliteTexture, vUv);
            vec3 satelliteColor = satelliteSample.rgb;
            
            // Check if we got valid color data (not all black/transparent)
            float colorSum = satelliteColor.r + satelliteColor.g + satelliteColor.b;
            
            // If we have valid color data, use it
            if (colorSum > 0.01) {
              // Enhance contrast and brightness for clearer imagery
              vec3 enhancedColor = (satelliteColor - 0.5) * 1.4 + 0.5;
              
              // Brightness boost to make imagery more visible
              enhancedColor = enhancedColor * 1.25;
              
              // Clamp to valid range
              enhancedColor = clamp(enhancedColor, 0.0, 1.0);
              
              // Use satellite imagery (100% - no blending with elevation colors)
              finalColor = enhancedColor;
            } else {
              // If texture is black/empty, fall back to elevation colors but dimmed
              finalColor = elevationColor * 0.7;
            }
          }
          
          // Calculate fade opacity based on distance from center
          float opacity = 1.0;
          if (fadeDistance > 0.0) {
            // Fade starts at fadeDistance and goes to 0 at fadeDistance * 1.5
            float fadeStart = fadeDistance;
            float fadeEnd = fadeDistance * 1.5;
            if (vDistanceFromCenter > fadeStart) {
              float fadeRange = fadeEnd - fadeStart;
              float fadeProgress = (vDistanceFromCenter - fadeStart) / fadeRange;
              opacity = 1.0 - clamp(fadeProgress, 0.0, 1.0);
            }
          }
          
          // Ensure we always output a visible color
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      side: THREE.FrontSide,
      transparent: safeFadeDistance > 0, // Enable transparency if fade is active
    })
    
    // Mark as ready immediately since we validated all uniforms before creating the material
    setMaterialReady(true)
    
    return shaderMaterial
  }, [geometry, heightRange, satelliteTexture, fadeDistance, terrainCenter])

  // Update material uniforms when satellite texture loads
  useEffect(() => {
    if (!material || !(material instanceof THREE.ShaderMaterial)) {
      return
    }
    
    // Verify uniforms exist before accessing
    if (!material.uniforms) {
      console.error('[LowPolyTerrain] Material has no uniforms!')
      return
    }
    
    const uniforms = material.uniforms
    
    // Check each uniform individually with try-catch
    try {
      if (!uniforms.minHeight) {
        console.error('[LowPolyTerrain] Missing minHeight uniform')
        return
      }
      if (!uniforms.maxHeight) {
        console.error('[LowPolyTerrain] Missing maxHeight uniform')
        return
      }
      if (!uniforms.satelliteTexture) {
        console.error('[LowPolyTerrain] Missing satelliteTexture uniform')
        return
      }
      if (!uniforms.useSatellite) {
        console.error('[LowPolyTerrain] Missing useSatellite uniform')
        return
      }
      if (!uniforms.fadeDistance) {
        console.error('[LowPolyTerrain] Missing fadeDistance uniform')
        return
      }
      if (!uniforms.terrainCenter) {
        console.error('[LowPolyTerrain] Missing terrainCenter uniform')
        return
      }
      
      // All uniforms exist, safe to update
      // CRITICAL: Always verify uniform exists and has .value before setting
      // If satelliteTexture is a CanvasTexture (not DataTexture), it means we loaded satellite tiles
      // Trust that it's valid and enable satellite mode
      const hasValidSatellite = satelliteTexture && 
                                satelliteTexture.constructor.name === 'CanvasTexture'
      
      if (hasValidSatellite) {
        // Get the canvas/image from various possible locations
        const img = (satelliteTexture as any).image instanceof HTMLCanvasElement 
          ? (satelliteTexture as any).image 
          : (satelliteTexture as any).source instanceof HTMLCanvasElement
          ? (satelliteTexture as any).source
          : satelliteTexture.image
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[LowPolyTerrain] ✅ Applying satellite texture to terrain:', {
            textureWidth: img.width,
            textureHeight: img.height,
            hasImage: !!img,
            textureType: satelliteTexture.constructor.name
          })
        }
        
        // Sample canvas to verify it has content
        if (img instanceof HTMLCanvasElement) {
          const testCtx = img.getContext('2d')
          if (testCtx) {
            const sample = testCtx.getImageData(img.width / 2, img.height / 2, 10, 10)
            let hasContent = false
            for (let i = 0; i < sample.data.length; i += 4) {
              const r = sample.data[i]
              const g = sample.data[i + 1]
              const b = sample.data[i + 2]
              if (r > 5 || g > 5 || b > 5) {
                hasContent = true
                break
              }
            }
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.log('[LowPolyTerrain] Canvas content check:', {
                hasContent,
                samplePixel: `rgb(${sample.data[0]}, ${sample.data[1]}, ${sample.data[2]})`
              })
            }
          }
        }
        
        // CRITICAL: Update both uniforms to enable satellite imagery
        if (uniforms.satelliteTexture && uniforms.satelliteTexture.value !== undefined) {
          uniforms.satelliteTexture.value = satelliteTexture
          console.log('[LowPolyTerrain] ✅ Satellite texture uniform updated:', {
            textureType: satelliteTexture.constructor.name,
            hasImage: !!(satelliteTexture as any).image,
            imageWidth: (satelliteTexture as any).image?.width,
            imageHeight: (satelliteTexture as any).image?.height,
            isCanvasTexture: satelliteTexture.constructor.name === 'CanvasTexture'
          })
        } else {
          console.error('[LowPolyTerrain] ❌ Cannot update satelliteTexture uniform - uniform missing!')
        }
        if (uniforms.useSatellite && uniforms.useSatellite.value !== undefined) {
          uniforms.useSatellite.value = 1.0
          console.log('[LowPolyTerrain] ✅ Satellite texture enabled (useSatellite = 1.0)')
        } else {
          console.error('[LowPolyTerrain] ❌ Cannot update useSatellite uniform - uniform missing!')
        }
        
        // Force updates
        satelliteTexture.needsUpdate = true
        material.needsUpdate = true
        
        // Verify texture is valid
        console.log('[LowPolyTerrain] 📊 Final texture check:', {
          textureType: satelliteTexture.constructor.name,
          wrapS: satelliteTexture.wrapS,
          wrapT: satelliteTexture.wrapT,
          minFilter: satelliteTexture.minFilter,
          magFilter: satelliteTexture.magFilter,
          needsUpdate: satelliteTexture.needsUpdate,
          uniformValue: uniforms.satelliteTexture?.value?.constructor.name,
          useSatelliteValue: uniforms.useSatellite?.value
        })
        
        // Verify the texture was applied - only log in development
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            if (uniforms.useSatellite.value === 1.0 && uniforms.satelliteTexture.value === satelliteTexture) {
              console.log('[LowPolyTerrain] ✅ Satellite texture successfully applied and active')
            } else {
              console.error('[LowPolyTerrain] ❌ Satellite texture NOT active:', {
                useSatellite: uniforms.useSatellite.value,
                expectedUseSatellite: 1.0,
                textureMatch: uniforms.satelliteTexture.value === satelliteTexture
              })
            }
          }, 100)
        }
      } else {
        console.error('[LowPolyTerrain] ❌ No valid satellite texture available!', {
          hasSatelliteTexture: !!satelliteTexture,
          hasImage: !!(satelliteTexture && (satelliteTexture as any).image),
          imageType: satelliteTexture && (satelliteTexture as any).image ? (satelliteTexture as any).image.constructor.name : 'none',
          imageWidth: satelliteTexture && (satelliteTexture as any).image ? (satelliteTexture as any).image.width : 0,
          imageHeight: satelliteTexture && (satelliteTexture as any).image ? (satelliteTexture as any).image.height : 0
        })
        // Ensure elevation colors are shown when no satellite texture
        if (uniforms.useSatellite && uniforms.useSatellite.value !== undefined) {
          uniforms.useSatellite.value = 0.0
        }
        material.needsUpdate = true
      }
    } catch (error) {
      console.error('[LowPolyTerrain] Error accessing/updating uniforms:', error)
    }
  }, [material, satelliteTexture, isLoadingSatellite])

  // Use fallback geometry while loading - make it visible with height
  const displayGeometry = useMemo(() => {
    if (geometry) {
      return geometry
    }
    // Create a visible test terrain with some height variation
    const fallback = new THREE.PlaneGeometry(terrainSize, terrainSize, 32, 32)
    fallback.rotateX(-Math.PI / 2)
    
    // Add some height variation to make it visible
    const positions = fallback.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      // Add a simple wave pattern so it's visible
      positions[i + 1] = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 100
    }
    fallback.attributes.position.needsUpdate = true
    fallback.computeVertexNormals()
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[LowPolyTerrain] Using fallback geometry with height variation')
    }
    return fallback
  }, [geometry, terrainSize])

  // Expose terrain mesh for debugging (silent)
  useEffect(() => {
    if (displayGeometry && meshRef.current) {
      // Expose to window for debugging without logging
      ;(window as any).__terrainMesh = meshRef.current
    }
  }, [displayGeometry])

  // CRITICAL: Use useFrame to ensure uniforms are always valid before each render
  // This prevents Three.js from accessing undefined uniforms
  useFrame(() => {
    if (!material || !(material instanceof THREE.ShaderMaterial)) {
      return
    }
    
    if (!material.uniforms) {
      // If no uniforms, make material invisible
      if (material.visible) {
        material.visible = false
      }
      return
    }
    
    const uniforms = material.uniforms
    
    // Ensure all uniforms exist and have valid values
    // If any uniform is missing, create it with a default value
    try {
      let needsUpdate = false
      
      if (!uniforms.minHeight || uniforms.minHeight.value === undefined) {
        uniforms.minHeight = { value: heightRange?.min ?? 0 }
        needsUpdate = true
      }
      if (!uniforms.maxHeight || uniforms.maxHeight.value === undefined) {
        uniforms.maxHeight = { value: heightRange?.max ?? 1000 }
        needsUpdate = true
      }
      if (!uniforms.satelliteTexture || uniforms.satelliteTexture.value === undefined) {
        // Create a default black texture if satellite texture isn't ready
        const fallbackTexture = new THREE.DataTexture(
          new Uint8Array([0, 0, 0, 255]),
          1, 1, THREE.RGBAFormat
        )
        fallbackTexture.needsUpdate = true
        uniforms.satelliteTexture = { value: fallbackTexture }
        needsUpdate = true
      }
      if (!uniforms.useSatellite || typeof uniforms.useSatellite.value === 'undefined') {
        uniforms.useSatellite = { value: 0.0 }
        needsUpdate = true
      }
      if (!uniforms.fadeDistance || typeof uniforms.fadeDistance.value === 'undefined') {
        uniforms.fadeDistance = { value: 0 }
        needsUpdate = true
      }
      if (!uniforms.terrainCenter || !(uniforms.terrainCenter.value instanceof THREE.Vector2)) {
        const centerX = Array.isArray(terrainCenter) && terrainCenter.length >= 2 ? terrainCenter[0] : 0
        const centerZ = Array.isArray(terrainCenter) && terrainCenter.length >= 2 ? terrainCenter[1] : 0
        uniforms.terrainCenter = { value: new THREE.Vector2(centerX, centerZ) }
        needsUpdate = true
      }
      
      if (!uniforms.satelliteTexture || uniforms.satelliteTexture.value === undefined) {
        // Create a default black texture if satellite texture isn't ready
        const fallbackTexture = new THREE.DataTexture(
          new Uint8Array([0, 0, 0, 255]),
          1, 1, THREE.RGBAFormat
        )
        fallbackTexture.needsUpdate = true
        uniforms.satelliteTexture = { value: fallbackTexture }
        needsUpdate = true
      }
      
      // Only make visible if all uniforms are valid
      if (needsUpdate) {
        material.needsUpdate = true
        // Keep invisible until all uniforms are set
        material.visible = false
      } else {
        // Verify ALL uniforms exist before making visible
        const allUniformsReady = 
          uniforms.minHeight?.value !== undefined &&
          uniforms.maxHeight?.value !== undefined &&
          uniforms.satelliteTexture?.value !== undefined &&
          uniforms.useSatellite?.value !== undefined &&
          uniforms.fadeDistance?.value !== undefined &&
          uniforms.terrainCenter?.value instanceof THREE.Vector2
        
        if (allUniformsReady) {
          // All uniforms are valid, make visible
          material.visible = true
        } else {
          // Still missing uniforms, keep invisible
          material.visible = false
        }
      }
    } catch (error) {
      // If there's any error accessing uniforms, make invisible
      if (material.visible) {
        material.visible = false
      }
    }
  })
  
  // Safety check: ensure material and geometry are ready before rendering
  if (!material || !displayGeometry) {
    return null
  }
  
  // For shader materials, ensure materialReady is true AND uniforms are valid
  if (material instanceof THREE.ShaderMaterial) {
    // Don't render at all if materialReady is false
    if (!materialReady) {
      return null
    }
    
    if (!material.uniforms) {
      return null
    }
    
    const uniforms = material.uniforms
    
    // Final check before render - ensure all uniforms exist and have .value
    try {
      // Check if uniforms exist and have value property
      const hasMinHeight = uniforms.minHeight && typeof uniforms.minHeight.value !== 'undefined' && isFinite(uniforms.minHeight.value)
      const hasMaxHeight = uniforms.maxHeight && typeof uniforms.maxHeight.value !== 'undefined' && isFinite(uniforms.maxHeight.value)
      const hasSatelliteTexture = uniforms.satelliteTexture && uniforms.satelliteTexture.value !== undefined && uniforms.satelliteTexture.value !== null
      const hasUseSatellite = uniforms.useSatellite && typeof uniforms.useSatellite.value !== 'undefined' && isFinite(uniforms.useSatellite.value)
      const hasFadeDistance = uniforms.fadeDistance && typeof uniforms.fadeDistance.value !== 'undefined' && isFinite(uniforms.fadeDistance.value)
      const hasTerrainCenter = uniforms.terrainCenter && uniforms.terrainCenter.value instanceof THREE.Vector2
      
      if (!hasMinHeight || !hasMaxHeight || !hasSatelliteTexture || !hasUseSatellite || !hasFadeDistance || !hasTerrainCenter) {
        // Don't render if uniforms aren't ready
        return null
      }
      
      // Also ensure material is visible
      if (!material.visible) {
        return null
      }
    } catch (error) {
      // If there's any error accessing uniforms, don't render
      return null
    }
  }

  // Don't render until material and geometry are ready AND uniforms are initialized
  // Also check if material is a shader material and has valid uniforms
  if (!material || !displayGeometry) {
    return null
  }
  
  // For shader materials, also check materialReady flag
  if (material instanceof THREE.ShaderMaterial && !materialReady) {
    return null
  }
  
  // For shader materials, ensure all uniforms exist before rendering
  if (material instanceof THREE.ShaderMaterial) {
    if (!material.uniforms) {
      return null
    }
    
    const uniforms = material.uniforms
    
    // Verify all required uniforms exist and have .value property
    try {
      const hasMinHeight = uniforms.minHeight && typeof uniforms.minHeight.value !== 'undefined' && isFinite(uniforms.minHeight.value)
      const hasMaxHeight = uniforms.maxHeight && typeof uniforms.maxHeight.value !== 'undefined' && isFinite(uniforms.maxHeight.value)
      const hasSatelliteTexture = uniforms.satelliteTexture && uniforms.satelliteTexture.value !== undefined
      const hasUseSatellite = uniforms.useSatellite && typeof uniforms.useSatellite.value !== 'undefined' && isFinite(uniforms.useSatellite.value)
      const hasFadeDistance = uniforms.fadeDistance && typeof uniforms.fadeDistance.value !== 'undefined' && isFinite(uniforms.fadeDistance.value)
      const hasTerrainCenter = uniforms.terrainCenter && uniforms.terrainCenter.value instanceof THREE.Vector2
      
      if (!hasMinHeight || !hasMaxHeight || !hasSatelliteTexture || !hasUseSatellite || !hasFadeDistance || !hasTerrainCenter) {
        // Don't render if uniforms aren't ready
        return null
      }
    } catch (error) {
      // If there's any error accessing uniforms, don't render
      return null
    }
  }

  return (
    <mesh
      ref={meshRef}
      geometry={displayGeometry}
      material={material}
      frustumCulled={true}
      receiveShadow={true}
      castShadow={true}
      position={[0, 0, 0]}
      renderOrder={0} // Render before water
    />
  )
}
