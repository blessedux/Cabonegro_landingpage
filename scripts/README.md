# DEM Download and Processing Scripts

Scripts to download and process DEM data from OpenTopography API for the Cabo Negro to Punta Arenas corridor.

## Prerequisites

Install required Python packages:

```bash
pip install requests rasterio numpy pillow scipy
```

Or using the project's package manager:

```bash
# If using pip
pip install -r requirements.txt

# If using npm/bun (if requirements.txt is added to package.json scripts)
```

## Quick Start

### Step 1: Download DEM Data

Download the raw DEM GeoTIFF from OpenTopography:

```bash
python scripts/download-dem-opentopography.py YOUR_API_KEY
```

This will:

- Download DEM data for the corridor area (-53.2° to -52.6° lat, -71.2° to -70.4° lng)
- Save to `public/assets/terrain/raw-dem.tif`
- Uses SRTMGL1 (30m resolution) by default

**Get your API key from:** https://portal.opentopography.org/apidocs/

### Step 2: Process to Heightmap

Convert the GeoTIFF to a normalized heightmap PNG:

```bash
python scripts/process-dem-to-heightmap.py
```

This will:

- Resample to 1024x1024 pixels (low-poly target)
- Normalize height values to 0-255 range
- Save to `public/assets/terrain/punta-arenas-cabonegro-heightmap.png`

### Custom Paths

You can specify custom input/output paths:

```bash
# Custom input
python scripts/process-dem-to-heightmap.py path/to/your-dem.tif

# Custom input and output
python scripts/process-dem-to-heightmap.py input.tif output.png
```

## What Happens Next

Once the heightmap PNG is in place at:

```
public/assets/terrain/punta-arenas-cabonegro-heightmap.png
```

The `LowPolyTerrain` component will automatically:

1. Load the heightmap
2. Generate low-poly geometry with vertex colors
3. Apply flat shading for video game aesthetic
4. Render with stylized lighting

## DEM Types Available

The download script uses `SRTMGL1` by default. You can modify the script to use other DEM types:

- **SRTMGL1**: SRTM Global 1 arc-second (30m resolution) - Recommended
- **SRTMGL3**: SRTM Global 3 arc-second (90m resolution) - Lower quality, faster
- **AW3D30**: ALOS World 3D 30m - Alternative 30m dataset
- **NASADEM**: NASA DEM - Updated SRTM data
- **COP30**: Copernicus GLO-30 - 30m resolution, European coverage

To change DEM type, edit `download-dem-opentopography.py`:

```python
DEM_TYPE = "SRTMGL1"  # Change to your preferred type
```

## Troubleshooting

### "Missing required packages"

Install dependencies:

```bash
pip install requests rasterio numpy pillow scipy
```

### "Input file not found"

Make sure you've run the download script first, or provide the correct path:

```bash
python scripts/process-dem-to-heightmap.py path/to/your-dem.tif
```

### "Error processing DEM"

- Check that the GeoTIFF file is valid
- Ensure the file isn't corrupted
- Try a different DEM type if the area isn't covered

### Large file sizes

The raw DEM might be large. The processing script resamples it to 1024x1024, which should be manageable.

## Manual Processing Alternative

If you prefer to use QGIS for processing, see:

- `public/assets/terrain/DEM_PROCESSING_GUIDE.md`

The QGIS workflow gives you more control over:

- Clipping extent
- Resampling method
- Normalization formula
- Output format
