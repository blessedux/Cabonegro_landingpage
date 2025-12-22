# High-Resolution 3D Terrain GLB Generator

This guide explains how to download terrain data and create a high-resolution 3D GLB file with realistic terrain displacement for coordinates **-52.937139, -70.849639** (20km radius).

## Overview

The workflow consists of two main steps:

1. **Download terrain data** - Downloads DEM heightmap and satellite imagery
2. **Generate 3D GLB** - Creates a 3D mesh with terrain displacement and applies textures

## Prerequisites

### 1. Python Dependencies

Install required Python packages:

```bash
# Using virtual environment (recommended)
python3 -m venv venv
./venv/bin/pip install -r scripts/requirements.txt

# Or install globally
pip3 install pygltflib pillow numpy rasterio requests scipy
```

### 2. OpenTopography API Key

You need a free API key from OpenTopography to download DEM data:

1. Visit: https://portal.opentopography.org/apidocs/
2. Sign up for a free account
3. Get your API key from the dashboard

Set it as an environment variable:

```bash
export OPENTOPOGRAPHY_API_KEY=your_api_key_here
```

Or pass it as an argument to the script.

## Step 1: Download Terrain Data

Download high-resolution DEM and satellite imagery:

```bash
# Using environment variable
python scripts/download-terrain-for-glb.py

# Or pass API key as argument
python scripts/download-terrain-for-glb.py YOUR_API_KEY

# With custom radius (default is 20km)
python scripts/download-terrain-for-glb.py YOUR_API_KEY 25
```

This script will:

- ✅ Download DEM data from OpenTopography (30m resolution)
- ✅ Download satellite imagery tiles (zoom level 14 for high resolution)
- ✅ Process DEM into heightmap PNG (2048x2048)
- ✅ Stitch satellite tiles into texture image

**Output files:**
- `public/assets/terrain/raw-dem-glb.tif` - Raw DEM data
- `public/assets/terrain/heightmap-glb.png` - Processed heightmap (2048x2048)
- `public/assets/terrain/texture-glb.png` - Satellite texture
- `public/assets/tiles/*.png` - Individual satellite tiles

**Estimated time:** 5-15 minutes (depending on internet speed)

## Step 2: Generate 3D GLB

Create the 3D terrain model:

```bash
# High quality (default, recommended)
python scripts/create-terrain-glb.py high

# Ultra quality (best, larger file)
python scripts/create-terrain-glb.py ultra

# Medium quality (smaller file)
python scripts/create-terrain-glb.py medium

# Low quality (smallest file)
python scripts/create-terrain-glb.py low
```

This script will:

- ✅ Load heightmap and texture
- ✅ Create 3D mesh with realistic terrain displacement
- ✅ Calculate vertex normals for proper lighting
- ✅ Apply satellite texture
- ✅ Export as optimized GLB file

**Output files:**
- `public/assets/models/terrain-3d.glb` - The 3D model file
- `public/assets/models/terrain-3d-metadata.json` - Metadata about the model
- `public/assets/terrain/terrain-texture-{quality}.png` - Texture reference

## Quality Presets

| Preset | Mesh Segments | Texture Size | File Size | Use Case |
|--------|--------------|--------------|-----------|----------|
| **ultra** | 512×512 | 4096×4096 | ~50-100 MB | Best quality, desktop only |
| **high** | 256×256 | 2048×2048 | ~10-20 MB | Recommended, good balance |
| **medium** | 128×128 | 1024×1024 | ~3-5 MB | Web-friendly |
| **low** | 64×64 | 512×512 | ~1-2 MB | Mobile-friendly |

**Recommendation:** Use `high` for most cases - it provides excellent quality while keeping file size reasonable.

## Complete Workflow

Run both steps in sequence:

```bash
# Step 1: Download data
python scripts/download-terrain-for-glb.py YOUR_API_KEY

# Step 2: Generate GLB
python scripts/create-terrain-glb.py high
```

## Using the GLB File

### In Three.js / React Three Fiber

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGLTF } from '@react-three/drei';

// Option 1: Using drei hook
function Terrain() {
  const { scene } = useGLTF('/assets/models/terrain-3d.glb');
  return <primitive object={scene} />;
}

// Option 2: Using GLTFLoader
const loader = new GLTFLoader();
loader.load('/assets/models/terrain-3d.glb', (gltf) => {
  scene.add(gltf.scene);
});
```

### In Blender / Other 3D Software

1. Open Blender
2. File → Import → glTF 2.0 (.glb/.gltf)
3. Select `terrain-3d.glb`
4. The terrain will import with textures applied

## File Structure

```
public/
├── assets/
│   ├── terrain/
│   │   ├── raw-dem-glb.tif          # Raw DEM data
│   │   ├── heightmap-glb.png         # Processed heightmap
│   │   ├── texture-glb.png           # Satellite texture
│   │   └── terrain-texture-*.png     # Texture references
│   ├── tiles/
│   │   └── 14_*.png                  # Satellite tiles (zoom 14)
│   └── models/
│       ├── terrain-3d.glb            # Final 3D model
│       └── terrain-3d-metadata.json  # Model metadata
```

## Troubleshooting

### "Missing required packages" error

Install dependencies:
```bash
pip install pygltflib pillow numpy rasterio requests scipy
```

### "API key not found" error

Set the API key:
```bash
export OPENTOPOGRAPHY_API_KEY=your_key
```

Or pass it as argument:
```bash
python scripts/download-terrain-for-glb.py YOUR_API_KEY
```

### DEM download fails

- Check your internet connection
- Verify your API key is valid
- Try again later (API may be rate-limited)

### GLB file is too large

Use a lower quality preset:
```bash
python scripts/create-terrain-glb.py medium  # or low
```

### Texture looks blurry

- Use `ultra` or `high` quality preset
- Ensure satellite tiles downloaded successfully
- Check that texture-glb.png exists and is high resolution

### Mesh looks flat

- Verify heightmap-glb.png exists
- Check that heightmap has proper elevation data
- Try increasing `height_scale` in the script (default: 500m)

## Technical Details

### Coordinate System

- **Center:** -52.937139°S, -70.849639°W
- **Radius:** 20km (configurable)
- **Terrain Size:** 40km × 40km (for 20km radius)

### DEM Data

- **Source:** OpenTopography SRTMGL1
- **Resolution:** 30 meters per pixel
- **Format:** GeoTIFF

### Satellite Imagery

- **Source:** ESRI World Imagery
- **Zoom Level:** 14 (high resolution)
- **Tile Size:** 256×256 pixels
- **Format:** PNG

### Mesh Generation

- Heightmap is sampled using bilinear interpolation
- Vertex normals are calculated from face normals
- UV coordinates map texture to terrain
- Mesh is optimized for web/real-time rendering

## Performance Tips

1. **For Web:** Use `high` or `medium` quality
2. **For Desktop Apps:** Use `ultra` quality
3. **For Mobile:** Use `low` quality
4. **File Size:** GLB files are binary and compressed, much smaller than separate OBJ + textures

## Next Steps

After generating the GLB:

1. Test it in your 3D application
2. Adjust quality preset if needed
3. Add lighting and camera controls
4. Integrate with your scene

## Support

If you encounter issues:

1. Check that all dependencies are installed
2. Verify API key is valid
3. Ensure output directories exist
4. Check file permissions

For more information, see:
- [3D Map Implementation Docs](../docs/3D_MAP_IMPLEMENTATION.md)
- [Terrain Assets Documentation](../docs/TERRAIN_ASSETS_DOCUMENTATION.md)

