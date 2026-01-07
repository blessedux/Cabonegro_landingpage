# Satellite Imagery Not Showing - Fix Guide

## Problem Diagnosis

Your diagnostic shows:

- ✅ Terrain mesh exists (66,049 vertices)
- ✅ Material is ShaderMaterial
- ❌ **`useSatellite: 0`** (should be 1.0)
- ❌ **Texture type: `DataTexture`** (should be `CanvasTexture`)

**Root Cause**: Satellite tiles are failing to load, so the code falls back to the default black `DataTexture` instead of creating a `CanvasTexture` from satellite tiles.

## Why Tiles Are Failing

Common reasons:

1. **CORS errors** - Tile providers blocking cross-origin requests
2. **Network issues** - Slow/unreliable connection
3. **Rate limiting** - Too many requests to tile servers
4. **Invalid coordinates** - Tiles don't exist for that location/zoom

## Solution: Download Tiles Locally

Download tiles once, serve them locally - no internet dependency!

### Step 1: Test Tile URLs (Optional)

```bash
node scripts/test-tile-urls.js
```

This verifies which tile providers work from your location.

### Step 2: Download Tiles

```bash
# Download tiles for zoom 13 (recommended - good balance)
node scripts/download-satellite-tiles.js 13

# This will:
# - Download ~22,500 tiles
# - Save to public/assets/tiles/
# - Take ~30-60 minutes
# - Show progress
```

### Step 3: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Verify

1. Open `/map` page
2. Check console - should see `[MapTiles] ✓ Loaded local tile` messages
3. Terrain should show satellite imagery!

## How It Works Now

1. **Local First**: Code checks `/assets/tiles/{zoom}_{x}_{y}.png`
2. **Online Fallback**: If local tile missing, tries ESRI/Bing/Google
3. **Automatic**: No code changes needed after download

## File Structure After Download

```
public/
└── assets/
    └── tiles/
        ├── 13_5601_2333.png
        ├── 13_5601_2334.png
        └── ... (~22,500 files)
```

## Quick Fix (Temporary)

If you need satellite imagery NOW without downloading:

```javascript
// Run in browser console on /map page
const terrain = window.__terrainMesh;
if (terrain?.material?.uniforms) {
  // Force enable satellite (even if texture is black)
  terrain.material.uniforms.useSatellite.value = 1.0;
  terrain.material.needsUpdate = true;
  console.log("✅ Forced satellite mode enabled");
}
```

**Note**: This won't show real imagery if tiles didn't load - it will just use the black texture. You still need to download tiles for real imagery.

## Verification Commands

### Check if tiles downloaded:

```bash
ls public/assets/tiles/ | wc -l
# Should show ~22,500 for zoom 13
```

### Check specific tile:

```bash
ls public/assets/tiles/13_5601_2333.png
# Should exist if download worked
```

### Browser console check:

```javascript
// Should show CanvasTexture, not DataTexture
const terrain = window.__terrainMesh;
console.log(
  "Texture type:",
  terrain.material.uniforms.satelliteTexture.value.constructor.name
);
console.log("useSatellite:", terrain.material.uniforms.useSatellite.value);
```

## Troubleshooting

### Still seeing DataTexture?

1. Verify tiles downloaded: `ls public/assets/tiles/ | head -10`
2. Hard refresh browser (Cmd+Shift+R)
3. Check console for `[MapTiles] ✓ Loaded local tile` messages
4. Verify tile path: `/assets/tiles/13_{x}_{y}.png`

### Download script fails?

1. Check internet connection
2. Try lower zoom: `node scripts/download-satellite-tiles.js 12`
3. Check ESRI servers: `node scripts/test-tile-urls.js`

### Tiles download but still black?

1. Check tile files are valid PNGs: `file public/assets/tiles/13_5601_2333.png`
2. Verify canvas has content (see DEBUG_SATELLITE_IMAGERY.md)
3. Check `useSatellite` is 1.0 (not 0)

## Next Steps

1. **Download tiles** (one-time, ~30-60 min)
2. **Commit to git** (if repo allows large files) OR use Git LFS
3. **Deploy** - tiles will be served statically from `public/`
4. **No internet needed** - map works offline!

## Benefits of Local Tiles

✅ **No CORS issues** - served from same origin
✅ **Faster loading** - no network requests
✅ **Works offline** - no internet dependency
✅ **Reliable** - no rate limiting or server issues
✅ **Consistent** - same tiles every time

## Storage Requirements

- **Zoom 13**: ~500MB - 1GB
- **Zoom 14**: ~2GB - 4GB (higher detail)

Recommendation: Start with zoom 13, upgrade to 14 if needed.





