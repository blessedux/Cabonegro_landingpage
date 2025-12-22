# Download Terrain Data for Punta Arenas

This guide explains how to download heightmap and satellite texture data for the coordinates:
**52°56'13.7"S 70°50'58.7"W** (Punta Arenas, Chile)

## Quick Start

### 1. Install Dependencies

```bash
# Python dependencies
pip install -r scripts/requirements.txt

# Or install individually:
pip install rasterio numpy pillow scipy requests
```

### 2. Get OpenTopography API Key

1. Go to https://portal.opentopography.org/apidocs/
2. Sign up for a free account
3. Get your API key from the dashboard

### 3. Run the Download Script

```bash
# Option 1: Set API key as environment variable
export OPENTOPOGRAPHY_API_KEY=your_api_key_here
python scripts/download-terrain-data.py

# Option 2: Pass API key as argument
python scripts/download-terrain-data.py YOUR_API_KEY

# Option 3: Specify custom radius (default is 20 km)
python scripts/download-terrain-data.py YOUR_API_KEY 30
```

## What the Script Does

The script automatically:

1. **Downloads DEM Heightmap Data**

   - Source: OpenTopography API (SRTM 30m resolution)
   - Area: 20km radius around the coordinates
   - Output: `public/assets/terrain/raw-dem-punta-arenas.tif`

2. **Processes DEM to Heightmap PNG**

   - Resamples to 1024x1024 pixels
   - Normalizes height values to 0-255 range
   - Output: `public/assets/terrain/punta-arenas-heightmap.png`

3. **Downloads Satellite Imagery Tiles**

   - Source: ESRI World Imagery
   - Zoom level: 13 (good detail for terrain)
   - Output: Individual tiles in `public/assets/tiles/`

4. **Stitches Tiles into Texture**
   - Composites all tiles into seamless image
   - Output: `public/assets/terrain/punta-arenas-texture.png` (2048x2048)

## Output Files

After running the script, you'll have:

- `public/assets/terrain/punta-arenas-heightmap.png` - Heightmap for 3D terrain
- `public/assets/terrain/punta-arenas-texture.png` - Satellite texture for terrain
- `public/assets/terrain/raw-dem-punta-arenas.tif` - Raw DEM data (can be deleted if not needed)
- `public/assets/tiles/*.png` - Individual satellite tiles

## Using the Data in Your 3D Scene

Update your terrain component to use the new files:

```tsx
<RealTerrain
  heightmapUrl="/assets/terrain/punta-arenas-heightmap.png"
  terrainSize={TERRAIN_SIZE}
  heightScale={1500}
/>
```

Or update the texture paths in your terrain components to use:

- `/assets/terrain/punta-arenas-texture.png`

## Troubleshooting

### API Key Issues

- Make sure your API key is valid
- Check that you haven't exceeded rate limits
- Verify the API key format (should be a string)

### Download Failures

- Check your internet connection
- Some tiles may fail to download (this is normal)
- The script will continue even if some tiles fail

### Processing Errors

- Make sure all Python dependencies are installed
- Check that `rasterio` can read GeoTIFF files
- Verify output directories exist and are writable

### File Size Issues

- Raw DEM files can be large (50-200 MB)
- Processed heightmaps are much smaller (~1 MB)
- Satellite textures depend on zoom level and area

## Customization

### Change Radius

```bash
python scripts/download-terrain-data.py YOUR_API_KEY 30  # 30km radius
```

### Change Zoom Level

Edit the script and modify the `zoom_level` parameter in `download_satellite_tiles()` function (default: 13)

### Change Output Size

Edit the `stitch_satellite_tiles()` call to use different sizes:

- `'low'` - 1024x1024
- `'medium'` - 2048x2048 (default)
- `'high'` - 4096x4096
- `'ultra'` - 8192x8192

## Coordinates Reference

- **Input**: 52°56'13.7"S 70°50'58.7"W
- **Decimal**: -52.9371°, -70.8496°
- **Location**: Punta Arenas, Chile
- **Area**: Strait of Magellan region

## Next Steps

1. Run the download script
2. Verify output files exist
3. Update your terrain components to use the new files
4. Adjust `heightScale` in your terrain component if needed
5. Test the 3D scene with the new terrain data
