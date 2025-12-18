# Map Troubleshooting Guide

## Issues Fixed

### 1. Added Debug Logging

- Added console logs to `LowPolyTerrain` component to track heightmap loading
- Added `TerrainDebug` component (dev mode only) to log terrain and camera info
- Removed `crossOrigin` setting that could cause CORS issues with local files

### 2. Enhanced Error Handling

- Better error messages in heightmap loader
- Detailed logging of geometry creation process
- Fallback terrain creation with warnings

## How to Debug

### Check Browser Console

Open browser DevTools (F12) and look for:

1. **Heightmap Loading:**

   ```
   [LowPolyTerrain] Loading heightmap from: /assets/terrain/punta-arenas-cabonegro-heightmap.png
   [LowPolyTerrain] Heightmap loaded successfully: {width: 1024, height: 1024, ...}
   [LowPolyTerrain] Creating low-poly geometry...
   [LowPolyTerrain] Geometry created successfully: {vertices: ..., triangles: ...}
   ```

2. **Terrain Debug Info:**

   ```
   [TerrainDebug] Scene initialized: {...}
   [TerrainDebug] Terrain mesh found: {...}
   ```

3. **Errors to Watch For:**
   - `Failed to load heightmap from ...` - File not found or path incorrect
   - `Could not get canvas context` - Browser issue
   - `Terrain mesh not found` - Terrain component not rendering

### Verify File Access

The heightmap should be accessible at:

```
http://localhost:3000/assets/terrain/punta-arenas-cabonegro-heightmap.png
```

Test in browser or with:

```bash
curl -I http://localhost:3000/assets/terrain/punta-arenas-cabonegro-heightmap.png
```

Should return: `HTTP/1.1 200 OK`

### Check Camera Position

The camera starts at `[0, 500, 1000]` looking at `[0, 0, 0]` (center of terrain).

If terrain isn't visible:

1. Check if camera is too close/far
2. Try zooming out (scroll or drag)
3. Check camera controls are enabled

### Common Issues

#### Issue: "Failed to load heightmap"

**Solution:**

- Verify file exists: `ls public/assets/terrain/punta-arenas-cabonegro-heightmap.png`
- Check file path in code matches actual location
- Ensure Next.js dev server is running
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

#### Issue: Terrain loads but is flat/not visible

**Possible causes:**

1. **Height scale too low:** Increase `heightScale` in `Experience3D.tsx`

   ```tsx
   <Terrain useLowPoly={true} heightScale={100} />
   ```

2. **Camera too far:** Terrain might be too small to see

   - Try zooming in
   - Check camera position in console

3. **Terrain below camera:** Camera might be looking down at empty space
   - Check camera `lookAt` position
   - Verify terrain is at `y=0`

#### Issue: Wrong location/terrain doesn't match

**Check:**

- Heightmap covers correct area: -53.2° to -52.6° lat, -71.2° to -70.4° lng
- Terrain size is 50km (TERRAIN_SIZE = 50000)
- Camera waypoints are within terrain bounds

#### Issue: Colors look wrong

**Adjust:**

- Elevation color thresholds in `low-poly-processor.ts`
- `getTerrainColor()` function
- Material properties in `LowPolyTerrain.tsx`

## Debugging Steps

1. **Open browser console** (F12)
2. **Navigate to** `/en/map`
3. **Check for errors** in console
4. **Look for debug logs** starting with `[LowPolyTerrain]` or `[TerrainDebug]`
5. **Verify heightmap loads:**
   - Should see "Heightmap loaded successfully"
   - Should see geometry creation logs
6. **Check terrain mesh:**
   - Should see "Terrain mesh found" in TerrainDebug
   - Should have geometry with vertices
7. **Test camera:**
   - Try WASD/Arrow keys to move
   - Try mouse drag to rotate
   - Check if you can see anything

## Quick Fixes

### Reset Camera Position

If camera is in wrong position, the initial waypoint is:

```typescript
position: [0, 500, 1000];
lookAt: [0, 0, 0];
```

### Increase Terrain Visibility

If terrain is too subtle:

```tsx
// In Experience3D.tsx
<Terrain
  useLowPoly={true}
  heightScale={100} // Increase from 50
/>
```

### Force Reload

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache
3. Restart dev server

## Next Steps

If issues persist:

1. Check all console errors
2. Verify heightmap file is correct (1024x1024, grayscale PNG)
3. Test with a simple flat terrain first
4. Check if other 3D components (Water, Buildings) are rendering
5. Verify React Three Fiber is working (check for R3F errors)
