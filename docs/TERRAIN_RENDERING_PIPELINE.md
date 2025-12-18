# Terrain Rendering Pipeline Documentation

## Overview

This document describes the complete pipeline for rendering 3D terrain with satellite imagery overlay for Cabo Negro, Chile. It covers coordinate systems, data sources, processing steps, and rendering to help debug why satellite imagery may not be visible.

---

## 1. Location & Coordinates

### Primary Location

- **Terrain Center**: `53°03'40.4"S 70°52'42.2"W` (Decimal: `-53.061222, -70.878388`)
- **Location**: Cabo Negro, Chile (Patagonia region)
- **Terrain Size**: 80km diameter (40km radius)
- **Bounding Box**:
  - Latitude: `-53.241222` to `-52.881222` (±0.18° ≈ ±20km)
  - Longitude: `-71.178388` to `-70.578388` (±0.30° ≈ ±20km)

### Coordinate System

- **World Space**: Meters (centered at terrain center)
- **Heightmap**: PNG grayscale image (`/assets/terrain/punta-arenas-cabonegro-heightmap.png`)
- **Height Scale**: 1500x exaggeration for visibility
- **Projection**: Mercator-like flat projection (suitable for small areas)

**Key Files**:

- `src/lib/terrain/coordinates.ts` - Coordinate conversion utilities

---

## 2. Satellite Imagery Provider

### Current Provider Priority

The system uses multiple satellite imagery providers with automatic fallback:

1. **ESRI World Imagery** (PRIMARY - 4 retries)

   - URL Pattern: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}`
   - Alternative: `https://services.arcgisonline.com/...`
   - **Why**: Most reliable, cloud-free, clear terrain imagery
   - **CORS**: Generally CORS-friendly (avoid `basemaps.arcgis.com`)

2. **Bing Maps Aerial** (SECONDARY - 2 retries)

   - URL Pattern: Uses quadkey format
   - **Why**: High quality, often clearer than Google

3. **Google Satellite** (TERTIARY - 2 retries)

   - URL Pattern: `https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={zoom}`
   - **Why**: Realistic, up-to-date imagery
   - **Note**: May be blocked by CORS

4. **Mapbox Satellite** (If API key available)

   - Requires: `NEXT_PUBLIC_MAPBOX_API_KEY` environment variable

5. **Maxar/DigitalGlobe** (Fallback)
   - Uses same ESRI endpoint

### Tile Loading Configuration

- **Zoom Level**: 13 (default) = ~30 meters per pixel
- **Canvas Size**: 4096x4096 pixels
- **Tile Size**: 256x256 pixels per tile
- **Coverage**: ~150 tiles per side (capped for performance)
- **Concurrency**: 8 parallel tile requests

**Key Files**:

- `src/lib/terrain/map-tiles.ts` - Tile loading and compositing logic

### Tile Coordinate System

- Uses standard Web Mercator tile coordinates (TMS/XYZ)
- Conversion: `latLngToTile(lat, lng, zoom)` → `{x, y}`
- Center tile calculated from `TERRAIN_CENTER` coordinates

---

## 3. Low-Poly Terrain Processing

### Heightmap Processing Pipeline

1. **Load Heightmap Image**

   - Source: `/assets/terrain/punta-arenas-cabonegro-heightmap.png`
   - Format: PNG grayscale (white = high, black = low)
   - Loaded via `Image` API, drawn to canvas

2. **Extract Height Data**

   - Canvas `getImageData()` extracts pixel values
   - Each pixel's red channel = height value (0-255)
   - Normalized to 0-1 range

3. **Create Low-Poly Geometry**

   - **Decimation Ratio**: 0.3 (30% of original resolution)
   - **Max Segments**: 256x256 (prevents stack overflow)
   - **Result**: ~66,000 vertices (from ~1.2M original)
   - **Geometry Type**: `THREE.PlaneGeometry` rotated -90° on X-axis

4. **Apply Height Displacement**

   - Each vertex Y-position = `normalizedHeight * heightScale`
   - **Height Scale**: 1500 meters
   - **Sea Level Offset**: -0.25 \* heightScale (25% of range = sea level)

5. **Generate Normals**
   - Computed from vertex positions for lighting
   - `geometry.computeVertexNormals()`

**Key Files**:

- `src/lib/terrain/low-poly-processor.ts` - Heightmap to geometry conversion
- `src/components/scenes/LowPolyTerrain.tsx` - Terrain component

---

## 4. Satellite Texture Compositing

### Tile Loading Process

1. **Calculate Required Tiles**

   - Determine tile bounds for 40km radius at zoom 13
   - Generate array of `{x, y}` tile coordinates

2. **Load Tiles in Parallel**

   - 8 concurrent requests (concurrency limit)
   - Each tile tries services in priority order (ESRI → Bing → Google → ...)
   - Retries with next service on failure
   - Creates placeholder (gray `#cccccc`) if all services fail

3. **Composite to Canvas**

   - Create 4096x4096 canvas
   - Calculate tile size: `canvasSize / max(tileCountX, tileCountY)`
   - Draw each loaded tile to correct position on canvas
   - Maintains geographic alignment

4. **Create Three.js Texture**
   - Convert canvas to `THREE.CanvasTexture`
   - Set wrapping: `THREE.RepeatWrapping` (S and T)
   - Set filtering: `THREE.LinearFilter`

**Key Files**:

- `src/lib/terrain/map-tiles.ts` - `loadSatelliteTexture()` function

---

## 5. Rendering Pipeline

### Material System

The terrain uses a custom shader material with two modes:

1. **Elevation-Only Mode** (`useSatellite = 0.0`)

   - Colors based on height:
     - Low: Dark green-brown `(0.3, 0.35, 0.25)`
     - Mid: Medium brown-green `(0.5, 0.55, 0.45)`
     - High: Light grey-brown `(0.7, 0.7, 0.65)`

2. **Satellite Overlay Mode** (`useSatellite = 1.0`)
   - Samples satellite texture at UV coordinates
   - Applies contrast enhancement: `(color - 0.5) * 1.4 + 0.5`
   - Applies brightness boost: `color * 1.25`
   - **100% satellite color** (no blending with elevation colors)

### Shader Uniforms

```glsl
uniform float minHeight;        // Minimum terrain height
uniform float maxHeight;        // Maximum terrain height
uniform sampler2D satelliteTexture;  // Satellite imagery texture
uniform float useSatellite;     // 0.0 = elevation colors, 1.0 = satellite
```

### Material Initialization Flow

1. **Load Heightmap** → Create geometry → Calculate `heightRange`
2. **Load Satellite Tiles** → Composite canvas → Create texture
3. **Validate Uniforms** → Ensure all values are finite and defined
4. **Create ShaderMaterial** → Only if validation passes
5. **Set `materialReady = true`** → Enable rendering

### Texture Application

- **UV Mapping**: Standard `(0,0)` to `(1,1)` across terrain
- **Texture Wrapping**: `THREE.RepeatWrapping` (allows tiling)
- **Update Trigger**: `satelliteTexture.needsUpdate = true` when texture changes

**Key Files**:

- `src/components/scenes/LowPolyTerrain.tsx` - Material creation and shader code

---

## 6. Debugging Checklist

### Issue: Satellite Imagery Not Visible

#### Step 1: Verify Tile Loading

**Check Browser Console**:

- Look for `[MapTiles]` logs (development mode only)
- Check for CORS errors: `Access to image at '...' has been blocked by CORS policy`
- Check for 404/400 errors on tile URLs

**Debug Commands** (in browser console):

```javascript
// Check if satellite texture was created
const terrain = window.__terrainMesh;
if (terrain && terrain.material) {
  console.log("Material:", terrain.material);
  console.log("Uniforms:", terrain.material.uniforms);
  if (terrain.material.uniforms.satelliteTexture) {
    const tex = terrain.material.uniforms.satelliteTexture.value;
    console.log("Satellite texture:", tex);
    console.log("Has image:", tex && tex.image);
    console.log(
      "Image type:",
      tex && tex.image ? tex.image.constructor.name : "none"
    );
    console.log(
      "Image size:",
      tex && tex.image ? `${tex.image.width}x${tex.image.height}` : "none"
    );
    console.log("useSatellite:", terrain.material.uniforms.useSatellite.value);
  }
}
```

#### Step 2: Verify Canvas Content

**Check if tiles actually loaded**:

```javascript
// Access the canvas from the texture
const terrain = window.__terrainMesh;
if (terrain && terrain.material && terrain.material.uniforms.satelliteTexture) {
  const tex = terrain.material.uniforms.satelliteTexture.value;
  if (tex && tex.image && tex.image instanceof HTMLCanvasElement) {
    const canvas = tex.image;
    const ctx = canvas.getContext("2d");
    const sample = ctx.getImageData(
      canvas.width / 2,
      canvas.height / 2,
      100,
      100
    );
    let nonBlack = 0;
    for (let i = 0; i < sample.data.length; i += 4) {
      if (
        sample.data[i] > 5 ||
        sample.data[i + 1] > 5 ||
        sample.data[i + 2] > 5
      ) {
        nonBlack++;
      }
    }
    console.log(
      `Canvas content: ${((nonBlack / (sample.data.length / 4)) * 100).toFixed(
        2
      )}% non-black pixels`
    );
    console.log(
      "Sample pixel:",
      `rgb(${sample.data[0]}, ${sample.data[1]}, ${sample.data[2]})`
    );
  }
}
```

#### Step 3: Test Tile URLs Manually

**Verify provider accessibility**:

```javascript
// Test ESRI tile URL (most common)
const centerTile = { x: 5601, y: 2333 }; // Approximate for zoom 13
const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/${centerTile.y}/${centerTile.x}`;
console.log("Testing tile URL:", url);

// Open in new tab to check if image loads
window.open(url, "_blank");
```

#### Step 4: Check Coordinate Alignment

**Verify terrain center matches tile center**:

```javascript
// Check if terrain center matches expected coordinates
import { TERRAIN_CENTER } from "@/lib/terrain/coordinates";
console.log("Terrain center:", TERRAIN_CENTER);
console.log("Expected: -53.061222, -70.878388");

// Calculate tile coordinates
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, 13);
console.log("Center tile (zoom 13):", centerTile);
```

#### Step 5: Force Satellite Texture Enable

**Manually enable satellite mode**:

```javascript
const terrain = window.__terrainMesh;
if (terrain && terrain.material && terrain.material.uniforms) {
  terrain.material.uniforms.useSatellite.value = 1.0;
  terrain.material.uniforms.satelliteTexture.value.needsUpdate = true;
  console.log("Forced satellite texture enabled");
}
```

### Common Issues & Solutions

#### Issue: All tiles are gray placeholders

**Cause**: All tile services failing (CORS, network, or invalid coordinates)
**Solution**:

1. Check network tab for failed requests
2. Try different zoom level (12 or 14)
3. Verify `TERRAIN_CENTER` coordinates are correct
4. Test tile URLs manually in browser

#### Issue: Tiles load but texture is black

**Cause**: Canvas compositing failed or tiles are out of bounds
**Solution**:

1. Check canvas content (see Step 2 above)
2. Verify tile coordinates are within valid range
3. Check if tiles are being drawn to correct canvas positions

#### Issue: Texture loads but shader doesn't use it

**Cause**: `useSatellite` uniform is 0.0 or texture not properly assigned
**Solution**:

1. Check `uniforms.useSatellite.value` (should be 1.0)
2. Verify `uniforms.satelliteTexture.value` is not null
3. Check shader fragment code (should use satellite when `useSatellite > 0.5`)

#### Issue: CORS errors blocking tiles

**Cause**: Tile provider doesn't allow cross-origin requests
**Solution**:

1. ESRI (`server.arcgisonline.com`) is most CORS-friendly
2. Google/Bing may block CORS - use ESRI as primary
3. Consider using a tile proxy server for production

---

## 7. Alternative Providers

If ESRI/Bing/Google fail, consider:

### 1. Mapbox (Requires API Key)

- High quality, reliable
- Requires: `NEXT_PUBLIC_MAPBOX_API_KEY`
- URL: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token={key}`

### 2. OpenStreetMap (Free, No Key)

- Lower quality but always available
- URL: `https://{a|b|c}.tile.openstreetmap.org/{z}/{x}/{y}.png`

### 3. NASA Worldview

- Good for specific dates
- URL: `https://map1.vis.earthdata.nasa.gov/wmts-geo/...`

### 4. Custom Tile Server

- Host your own tiles (requires tile generation)
- Full control, no CORS issues

---

## 8. Performance Optimization

### Current Settings

- **Geometry**: ~66,000 vertices (low-poly)
- **Texture**: 4096x4096 (4K)
- **Tiles**: ~22,500 tiles (150x150) at zoom 13
- **Concurrency**: 8 parallel requests

### Optimization Options

1. **Reduce Zoom Level**

   - Zoom 12 = ~60m per pixel (fewer tiles, faster loading)
   - Zoom 14 = ~15m per pixel (more tiles, slower loading)

2. **Reduce Canvas Size**

   - 2048x2048 = faster compositing, lower quality
   - 8192x8192 = slower compositing, higher quality

3. **Increase Concurrency**

   - More parallel requests = faster loading
   - Risk: Rate limiting from providers

4. **Cache Tiles**
   - Store loaded tiles in IndexedDB
   - Reuse on subsequent loads

---

## 9. File Structure

```
src/
├── lib/terrain/
│   ├── coordinates.ts          # Coordinate conversion, terrain center, bounds
│   ├── map-tiles.ts            # Satellite tile loading and compositing
│   └── low-poly-processor.ts   # Heightmap to geometry conversion
│
├── components/scenes/
│   ├── LowPolyTerrain.tsx      # Main terrain component (material, shader)
│   ├── Experience3D.tsx        # 3D scene setup
│   └── TerrainStatus.tsx        # Debug status overlay
│
└── app/[locale]/map/
    └── page.tsx                 # Map route page

public/
└── assets/terrain/
    └── punta-arenas-cabonegro-heightmap.png  # Heightmap source
```

---

## 10. Next Steps for Debugging

1. **Enable verbose logging** (temporarily):

   - Remove `process.env.NODE_ENV === 'development'` checks
   - Log all tile load attempts and results

2. **Test with known-good coordinates**:

   - Try a well-known location (e.g., San Francisco)
   - Verify tile loading works, then adjust for Cabo Negro

3. **Visualize tile coverage**:

   - Draw tile boundaries on canvas
   - Verify tiles align with terrain bounds

4. **Check shader compilation**:

   - Verify shader compiles without errors
   - Check WebGL context for errors

5. **Compare with reference**:
   - Open ESRI World Imagery in browser
   - Compare visual appearance with rendered texture

---

## Summary

The terrain rendering pipeline:

1. **Loads heightmap** → Creates low-poly geometry
2. **Loads satellite tiles** → Composites to canvas texture
3. **Creates shader material** → Applies texture with elevation data
4. **Renders mesh** → Displays in 3D scene

**Current Status**: Mesh and heightmap visible, but satellite imagery not showing. Likely causes:

- Tile loading failures (CORS, network)
- Canvas compositing issues
- Shader uniform not enabled
- Coordinate misalignment

Use the debugging checklist above to identify the specific issue.
