# DEM Processing Guide for Low-Poly Terrain

## Overview

This guide explains how to acquire and process real satellite/DEM data to create a low-poly heightmap for the Cabo Negro to Punta Arenas corridor.

## Area Coverage

- **Bounding Box:**
  - Latitude: -53.2° to -52.6°
  - Longitude: -71.2° to -70.4°
  - Approximate size: ~50km x 50km

## Quick Start (Automated Scripts)

**Recommended:** Use the automated Python scripts for fastest workflow.

### Prerequisites

```bash
pip install requests rasterio numpy pillow scipy
```

### One-Command Workflow

```bash
./scripts/download-and-process.sh YOUR_API_KEY
```

This will:

1. Download DEM from OpenTopography API
2. Process to 1024x1024 heightmap PNG
3. Save to `public/assets/terrain/punta-arenas-cabonegro-heightmap.png`

**Get your API key from:** https://portal.opentopography.org/apidocs/

### Step-by-Step (Manual)

```bash
# Step 1: Download
python scripts/download-dem-opentopography.py YOUR_API_KEY

# Step 2: Process
python scripts/process-dem-to-heightmap.py
```

See `scripts/README.md` for detailed documentation.

---

## Manual Processing (QGIS)

If you prefer manual control or want to use QGIS:

## Step 1: Download DEM Data

### Option A: Copernicus GLO-30 (Recommended)

1. **Register:**

   - Go to https://scihub.copernicus.eu
   - Create a free account

2. **Search:**

   - Search for tiles covering the area
   - Use coordinates: -53.2, -71.2, -52.6, -70.4
   - Product: "GLO-30" or "COPERNICUS_30"

3. **Download:**
   - Download GeoTIFF files
   - May need multiple tiles to cover the area

### Option B: SRTM (Alternative)

1. **USGS EarthExplorer:**

   - Go to https://earthexplorer.usgs.gov
   - Search for SRTM 30m data
   - Download tiles: S23W072, S23W071, S24W072, S24W071

2. **OpenTopography:**
   - Go to https://opentopography.org
   - Search for SRTM data
   - Download GeoTIFF files

## Step 2: Process in QGIS

### Load and Merge Tiles

1. **Open QGIS:**

   - Layer > Add Layer > Add Raster Layer
   - Load all downloaded DEM tiles

2. **Merge Tiles (if multiple):**
   - Raster > Miscellaneous > Merge
   - Select all DEM layers
   - Output: `merged_dem.tif`

### Clip to Area

1. **Set Extent:**

   - View > Panels > Layers Panel
   - Right-click merged layer > Properties > Source
   - Note the extent

2. **Clip Raster:**
   - Raster > Extraction > Clip Raster by Extent
   - Set extent manually:
     - X min: -71.2
     - Y min: -53.2
     - X max: -70.4
     - Y max: -52.6
   - Output: `clipped_dem.tif`

### Simplify for Low-Poly

1. **Resample (Reduce Resolution):**

   - Raster > Projections > Warp (Reproject)
   - Target resolution: 50-100 meters (for low-poly)
   - Output size: 1024x1024 pixels
   - Resampling: Bilinear or Cubic
   - Output: `resampled_dem.tif`

2. **Alternative: GDAL Translate:**
   ```bash
   gdal_translate -outsize 1024 1024 -r bilinear clipped_dem.tif resampled_dem.tif
   ```

### Normalize Height Values

1. **Get Min/Max:**

   - Raster > Analysis > Raster Calculator
   - Check layer statistics for min/max values

2. **Normalize:**
   - Raster Calculator:
   - Formula: `((DEM - min) / (max - min)) * 255`
   - Output: `normalized_dem.tif`

### Export as Heightmap

1. **Export:**

   - Right-click normalized layer > Export > Save As
   - Format: PNG
   - Color: Grayscale
   - Output: `punta-arenas-cabonegro-heightmap.png`

2. **Verify:**
   - Open PNG in image editor
   - Should be 1024x1024 grayscale
   - Dark = low elevation, Light = high elevation

## Step 3: Place in Project

1. **Copy File:**

   - Copy `punta-arenas-cabonegro-heightmap.png` to:
   - `public/assets/terrain/punta-arenas-cabonegro-heightmap.png`

2. **Verify:**
   - File should be accessible at:
   - `/assets/terrain/punta-arenas-cabonegro-heightmap.png`

## Alternative: Automated Processing (Python Scripts)

**Recommended approach:** Use the provided Python scripts for automated processing.

See `scripts/README.md` for complete documentation, or run:

```bash
# Install dependencies
pip install requests rasterio numpy pillow scipy

# Download and process in one command
./scripts/download-and-process.sh YOUR_API_KEY
```

The scripts handle:

- Downloading from OpenTopography API
- Resampling to 1024x1024
- Normalizing height values
- Exporting as PNG heightmap

## Troubleshooting

- **File too large:** Reduce resolution further (512x512)
- **Terrain too flat:** Increase height scale in component
- **Colors wrong:** Check normalization formula
- **Missing areas:** Verify bounding box coordinates

## Next Steps

Once the heightmap is in place, the LowPolyTerrain component will automatically:

- Load the heightmap
- Generate low-poly geometry with vertex colors
- Apply flat shading for video game aesthetic
- Render with stylized lighting
