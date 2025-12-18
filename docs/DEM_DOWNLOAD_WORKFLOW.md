# DEM Download Workflow - Quick Reference

## Complete Workflow

### Option 1: One-Command (Recommended)

```bash
./scripts/download-and-process.sh YOUR_API_KEY
```

This single command will:

1. Download DEM from OpenTopography
2. Process to heightmap PNG
3. Place it in the correct location

### Option 2: Step-by-Step

```bash
# Step 1: Download DEM
python scripts/download-dem-opentopography.py YOUR_API_KEY

# Step 2: Process to heightmap
python scripts/process-dem-to-heightmap.py
```

## Prerequisites

Install Python dependencies:

```bash
pip install requests rasterio numpy pillow scipy
```

## Get Your API Key

1. Go to https://portal.opentopography.org/apidocs/
2. Register/login
3. Request an API key
4. Copy your key

## What Gets Created

### After Download

- `public/assets/terrain/raw-dem.tif` - Raw GeoTIFF from OpenTopography

### After Processing

- `public/assets/terrain/punta-arenas-cabonegro-heightmap.png` - Final heightmap (1024x1024, normalized)

## Verification

After processing, verify the file exists:

```bash
ls -lh public/assets/terrain/punta-arenas-cabonegro-heightmap.png
```

The file should be:

- Format: PNG (grayscale)
- Size: 1024x1024 pixels
- Size on disk: ~1 MB

## Using the Heightmap

Once the heightmap is in place, the 3D map will automatically use it:

1. Navigate to `/en/map` (or `/[locale]/map`)
2. The `LowPolyTerrain` component will load the heightmap
3. Terrain will render with low-poly aesthetic and vertex colors

## Troubleshooting

### "Missing required packages"

```bash
pip install requests rasterio numpy pillow scipy
```

### "API key invalid"

- Check your API key at https://portal.opentopography.org/apidocs/
- Ensure you've activated your account
- Try regenerating the key

### "Download failed"

- Check your internet connection
- Verify the coordinates are correct
- Try a different DEM type (edit `DEM_TYPE` in download script)

### "Processing failed"

- Ensure the raw DEM file exists
- Check file permissions
- Verify the GeoTIFF is not corrupted

## DEM Types

The script uses `SRTMGL1` (30m resolution) by default. To change:

Edit `scripts/download-dem-opentopography.py`:

```python
DEM_TYPE = "SRTMGL1"  # Options: SRTMGL1, SRTMGL3, AW3D30, NASADEM, COP30
```

## Area Covered

- **Latitude:** -53.2° to -52.6°
- **Longitude:** -71.2° to -70.4°
- **Size:** ~50km x 50km (Cabo Negro to Punta Arenas corridor)

## Next Steps

After the heightmap is created:

1. Test the 3D map at `/en/map`
2. Verify terrain loads correctly
3. Check performance (should maintain 60 FPS)
4. Adjust height scale if needed (in `LowPolyTerrain` component)
