# Placeholder Heightmap

## Current Status

The terrain system is configured to use a heightmap at:
`/assets/terrain/cabonegro-heightmap.png`

**If this file doesn't exist**, the system will automatically use a flat terrain fallback.

## To Add Real Heightmap

1. **Download DEM Data:**

   - Register at [scihub.copernicus.eu](https://scihub.copernicus.eu) for Copernicus GLO-30
   - Or use [OpenTopography.org](https://opentopography.org) for GMTED2010/SRTM
   - Search for tiles covering coordinates: -52.937139, -70.849639

2. **Process the Data:**

   - Use QGIS (free) to:
     - Load the GeoTIFF DEM file
     - Clip to area of interest (~10-20km radius)
     - Export as grayscale PNG
   - Or use online tools like [terrain.party](https://terrain.party)

3. **Specifications:**

   - Format: PNG (grayscale)
   - Resolution: 1024x1024 pixels (recommended)
   - Coverage: ~10-20km radius around Cabo Negro
   - File name: `cabonegro-heightmap.png`
   - Location: Place in this directory (`public/assets/terrain/`)

4. **After Adding:**
   - The terrain will automatically use the new heightmap
   - No code changes needed
   - The displacement scale can be adjusted in `Terrain.tsx` if needed

## Fallback Behavior

If no heightmap is found, the system creates a flat terrain automatically.
This ensures the scene always loads, even without heightmap data.
